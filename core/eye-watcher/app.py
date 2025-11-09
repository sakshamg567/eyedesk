import json
import math
import time
from datetime import datetime

import cv2
import mediapipe as mp
import numpy as np
import requests

# Initialize MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    static_image_mode=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

# Define Landmark Indices
LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]
LEFT_EYE_CORNERS = [33, 133]
RIGHT_EYE_CORNERS = [362, 263]
LEFT_EYE_LIDS = [159, 145]
RIGHT_EYE_LIDS = [386, 374]
LEFT_EYE_OUTLINE = [
    33,
    7,
    163,
    144,
    145,
    153,
    154,
    155,
    133,
    173,
    157,
    158,
    159,
    160,
    161,
    246,
]
RIGHT_EYE_OUTLINE = [
    362,
    382,
    381,
    380,
    374,
    373,
    390,
    249,
    263,
    466,
    388,
    387,
    386,
    385,
    384,
    398,
]

# Adjusted Angular Thresholds for better detection
CENTER_ANGLE_HORIZONTAL = 15  # Tighter threshold for horizontal center detection
CENTER_ANGLE_VERTICAL = 20  # Vertical center threshold

# Alert settings
ALERT_FRAMES = 45  # About 1.5 seconds at 30 fps
off_center_count = 0

# Server settings
SERVER_URL = "http://localhost:65000/iris-watcher"
SEND_INTERVAL = 5  # Send data every 5 seconds
last_send_time = time.time()
focus_log = []  # Store focus data in memory


# Capture webcam
cap = cv2.VideoCapture(0)
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0


def send_to_server(is_focused):
    """
    Send focus status to local server silently (no console output)
    """
    data = {
        "timestamp": datetime.now().isoformat(),
        "status": "focused" if is_focused else "unfocused",
    }

    # Add to in-memory log
    focus_log.append(data)

    # Try to send to server (silently)
    try:
        response = requests.post(SERVER_URL, json=data, timeout=2)
    except:
        pass  # Silently ignore errors

    # Save to local files as backup (silently)
    try:
        with open("focus_log.json", "w") as f:
            json.dump(focus_log, f, indent=2)

        with open("focus_log.txt", "a") as f:
            f.write(f"{data['timestamp']} - {data['status']}\n")
    except:
        pass  # Silently ignore errors


def get_iris_position(face_landmarks, iris_idxs, corner_idxs, lid_idxs, w, h):
    """
    Calculate iris position relative to eye center
    Returns normalized horizontal and vertical ratios
    """
    # Get eye corners
    left_corner = face_landmarks.landmark[corner_idxs[0]]
    right_corner = face_landmarks.landmark[corner_idxs[1]]

    # Get eyelids
    top_lid = face_landmarks.landmark[lid_idxs[0]]
    bottom_lid = face_landmarks.landmark[lid_idxs[1]]

    # Calculate eye center
    eye_center_x = (left_corner.x + right_corner.x) / 2
    eye_center_y = (top_lid.y + bottom_lid.y) / 2

    # Calculate iris center
    iris_x = sum([face_landmarks.landmark[i].x for i in iris_idxs]) / len(iris_idxs)
    iris_y = sum([face_landmarks.landmark[i].y for i in iris_idxs]) / len(iris_idxs)

    # Calculate eye width and height for normalization
    eye_width = abs(right_corner.x - left_corner.x)
    eye_height = abs(bottom_lid.y - top_lid.y)

    # Calculate normalized position (-1 to 1, where 0 is center)
    horizontal_ratio = (iris_x - eye_center_x) / (eye_width / 2) if eye_width > 0 else 0
    vertical_ratio = (iris_y - eye_center_y) / (eye_height / 2) if eye_height > 0 else 0

    return horizontal_ratio, vertical_ratio, iris_x, iris_y, eye_center_x, eye_center_y


def draw_eye_landmarks(
    face_landmarks, iris_idxs, corner_idxs, lid_idxs, outline_idxs, frame, w, h
):
    """
    Draw eye landmarks for visualization
    """
    # Draw eye outline (yellow)
    pts = np.array(
        [
            (
                int(face_landmarks.landmark[i].x * w),
                int(face_landmarks.landmark[i].y * h),
            )
            for i in outline_idxs
        ]
    )
    cv2.polylines(frame, [pts], True, (0, 255, 255), 1)

    # Draw eye corners (green)
    for i in corner_idxs:
        x = int(face_landmarks.landmark[i].x * w)
        y = int(face_landmarks.landmark[i].y * h)
        cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

    # Draw eyelids (orange)
    for i in lid_idxs:
        x = int(face_landmarks.landmark[i].x * w)
        y = int(face_landmarks.landmark[i].y * h)
        cv2.circle(frame, (x, y), 3, (0, 165, 255), -1)

    # Draw iris landmarks (pink)
    for i in iris_idxs:
        x = int(face_landmarks.landmark[i].x * w)
        y = int(face_landmarks.landmark[i].y * h)
        cv2.circle(frame, (x, y), 2, (255, 105, 180), -1)


def is_looking_center(horizontal_ratio, vertical_ratio):
    """
    Determine if the person is looking at center (screen)
    """
    # Check if both horizontal and vertical ratios are within center threshold
    # Increased thresholds by 75% for less sensitivity (more tolerance)
    h_threshold = 0.26  # Normalized threshold for horizontal (0.15 * 1.75 ≈ 0.26)
    v_threshold = 0.44  # Normalized threshold for vertical (0.25 * 1.75 ≈ 0.44)

    is_h_center = abs(horizontal_ratio) < h_threshold
    is_v_center = abs(vertical_ratio) < v_threshold

    return is_h_center and is_v_center


# Main loop
while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("Failed to read frame")
        break

    # Flip frame for mirror effect and convert to RGB
    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w, _ = frame.shape

    # Process frame with FaceMesh
    results = face_mesh.process(rgb_frame)

    is_focused = False

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # Get iris positions for both eyes
            (
                left_h_ratio,
                left_v_ratio,
                left_iris_x,
                left_iris_y,
                left_center_x,
                left_center_y,
            ) = get_iris_position(
                face_landmarks, LEFT_IRIS, LEFT_EYE_CORNERS, LEFT_EYE_LIDS, w, h
            )

            (
                right_h_ratio,
                right_v_ratio,
                right_iris_x,
                right_iris_y,
                right_center_x,
                right_center_y,
            ) = get_iris_position(
                face_landmarks, RIGHT_IRIS, RIGHT_EYE_CORNERS, RIGHT_EYE_LIDS, w, h
            )

            # Draw landmarks for visualization
            draw_eye_landmarks(
                face_landmarks,
                LEFT_IRIS,
                LEFT_EYE_CORNERS,
                LEFT_EYE_LIDS,
                LEFT_EYE_OUTLINE,
                frame,
                w,
                h,
            )
            draw_eye_landmarks(
                face_landmarks,
                RIGHT_IRIS,
                RIGHT_EYE_CORNERS,
                RIGHT_EYE_LIDS,
                RIGHT_EYE_OUTLINE,
                frame,
                w,
                h,
            )

            # Draw iris and eye centers for debugging
            cv2.circle(
                frame, (int(left_iris_x * w), int(left_iris_y * h)), 3, (0, 0, 255), -1
            )
            cv2.circle(
                frame,
                (int(right_iris_x * w), int(right_iris_y * h)),
                3,
                (0, 0, 255),
                -1,
            )
            cv2.circle(
                frame,
                (int(left_center_x * w), int(left_center_y * h)),
                3,
                (255, 0, 0),
                -1,
            )
            cv2.circle(
                frame,
                (int(right_center_x * w), int(right_center_y * h)),
                3,
                (255, 0, 0),
                -1,
            )

            # Average the ratios from both eyes
            avg_h_ratio = (left_h_ratio + right_h_ratio) / 2
            avg_v_ratio = (left_v_ratio + right_v_ratio) / 2

            # Check if both eyes are looking at center
            left_centered = is_looking_center(left_h_ratio, left_v_ratio)
            right_centered = is_looking_center(right_h_ratio, right_v_ratio)

            # Both eyes should be centered for "focused" status
            is_focused = left_centered and right_centered

            # Display debug info
            debug_y = 100
            cv2.putText(
                frame,
                f"L H: {left_h_ratio:.2f} V: {left_v_ratio:.2f}",
                (10, debug_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )
            cv2.putText(
                frame,
                f"R H: {right_h_ratio:.2f} V: {right_v_ratio:.2f}",
                (10, debug_y + 25),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

    # Update focus counter
    if not is_focused:
        off_center_count += 1
    else:
        off_center_count = 0

    # Send focus data every 5 seconds (silently)
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        send_to_server(is_focused)
        last_send_time = current_time

    # Display FOCUSED or UNFOCUSED status
    if is_focused:
        status_text = "FOCUSED"
        status_color = (0, 255, 0)  # Green
        bg_color = (0, 100, 0)  # Dark green background
    else:
        status_text = "UNFOCUSED"
        status_color = (0, 0, 255)  # Red
        bg_color = (0, 0, 100)  # Dark red background

    # Draw status box at the top
    cv2.rectangle(frame, (0, 0), (w, 80), bg_color, -1)
    text_size = cv2.getTextSize(status_text, cv2.FONT_HERSHEY_SIMPLEX, 2.0, 3)[0]
    text_x = (w - text_size[0]) // 2
    cv2.putText(
        frame, status_text, (text_x, 60), cv2.FONT_HERSHEY_SIMPLEX, 2.0, status_color, 3
    )

    # If unfocused for too long, add extra warning
    if off_center_count > ALERT_FRAMES:
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, h), (0, 0, 255), -1)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
        cv2.putText(
            frame,
            "LOOK AT SCREEN!",
            (w // 4, h // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (255, 255, 255),
            4,
        )

    # Display the frame
    # cv2.imshow('Eye Tracking - Focus Monitor', frame)

    # Exit on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
face_mesh.close()
