import mediapipe as mp
import cv2
import numpy as np
import json
import argparse
from datetime import timedelta
from collections import deque
import subprocess
# MediaPipe setup
mp_pose = mp.solutions.pose
mp_drawings = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Custom JSON encoder to handle NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, deque):
            return list(obj)
        return super(NumpyEncoder, self).default(obj)

def getAngle(a, b, c):
    """Calculate angle between three points"""
    pA = np.array(a)
    pB = np.array(b)
    pC = np.array(c)
    ab = pB - pA
    bc = pC - pB
    
    # Ensure we don't get NaN due to numerical issues
    dot_product = np.clip(np.dot(ab, bc) / (np.linalg.norm(ab) * np.linalg.norm(bc)), -1.0, 1.0)
    angle = np.arccos(dot_product)
    return np.degrees(angle)

def getPosture(results, img):
    """Calculate head tilt and shoulder tilt"""
    height, width, _ = img.shape
    
    # Extract landmarks
    nose = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].x * width), 
            int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.NOSE].y * height))
    
    left_shoulder = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].x * width), 
                     int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].y * height))
    
    right_shoulder = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * width), 
                      int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].y * height))
    
    # Calculate tilts
    head_tilt = getAngle(left_shoulder, nose, right_shoulder)
    shoulder_tilt = np.abs(left_shoulder[1] - right_shoulder[1])
    
    return head_tilt, shoulder_tilt

def getSpineAngle(results, img):
    """Calculate spine angle"""
    height, width, _ = img.shape
    
    # Extract landmarks
    left_shoulder = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].x * width), 
                     int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER].y * height))
    
    right_shoulder = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * width), 
                      int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER].y * height))
    
    left_hip = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP].x * width), 
                int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP].y * height))
    
    right_hip = (int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP].x * width), 
                 int(results.pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP].y * height))
    
    # Calculate midpoints
    shoulder_midpoint = ((left_shoulder[0] + right_shoulder[0]) // 2, 
                         (left_shoulder[1] + right_shoulder[1]) // 2)
    
    hip_midpoint = ((left_hip[0] + right_hip[0]) // 2, 
                    (left_hip[1] + right_hip[1]) // 2)
    
    # Calculate spine angle (180 degrees would be perfectly straight)
    # We use a point above the shoulder midpoint to create a vertical reference line
    vertical_reference = (shoulder_midpoint[0], shoulder_midpoint[1] - 100)  # 100 pixels above
    
    spine_angle = getAngle(vertical_reference, shoulder_midpoint, hip_midpoint)
    
    # Adjust angle to make it intuitive: 180 = straight, lower = bent forward
    spine_angle = 180 - spine_angle
    
    return spine_angle

def getHandGestureMetrics(results, img, hand_movement_history, window_size=30):
    """
    Analyze hand gestures and movement patterns for presentation assessment
    
    Args:
        results: MediaPipe pose detection results
        img: The current frame
        hand_movement_history: Deque to track recent hand movements
        window_size: Number of frames to analyze for movement patterns
        
    Returns:
        Dictionary with hand gesture metrics
    """
    height, width, _ = img.shape
    
    # Extract hand landmarks
    landmarks = [
        (mp_pose.PoseLandmark.LEFT_WRIST, "left_wrist"),
        (mp_pose.PoseLandmark.RIGHT_WRIST, "right_wrist"),
        (mp_pose.PoseLandmark.LEFT_INDEX, "left_index"),
        (mp_pose.PoseLandmark.RIGHT_INDEX, "right_index"),
        (mp_pose.PoseLandmark.LEFT_SHOULDER, "left_shoulder"),  # Added for height reference
        (mp_pose.PoseLandmark.RIGHT_SHOULDER, "right_shoulder"),  # Added for height reference
        (mp_pose.PoseLandmark.LEFT_HIP, "left_hip"),  # Added for height reference
        (mp_pose.PoseLandmark.RIGHT_HIP, "right_hip")  # Added for height reference
    ]
    
    current_positions = {}
    
    # Get current landmark positions
    for landmark_id, name in landmarks:
        visibility = results.pose_landmarks.landmark[landmark_id].visibility
        if visibility > 0.5:  # Only use visible landmarks
            x = int(results.pose_landmarks.landmark[landmark_id].x * width) if results.pose_landmarks.landmark[landmark_id].x is not None else 0
            y = int(results.pose_landmarks.landmark[landmark_id].y * height) if results.pose_landmarks.landmark[landmark_id].y is not None else 0
            current_positions[name] = (x, y)
    
    # Initialize metrics
    metrics = {
        "total_movement": 0,
        "left_hand_movement": 0,
        "right_hand_movement": 0,
        "movement_symmetry": 0,
        "hand_height_variance": 0,
        "is_using_gestures": False,
        "gesture_quality": "none",  # simplified to: none, poor, good
        "hands_at_chest_level": False,
        "dominant_hand": "none"  # Added metric for dominant hand
    }
    
    # Check if hands are at appropriate level (above hip)
    hands_at_proper_height = False
    
    if ("left_wrist" in current_positions and "left_hip" in current_positions):
        # Check if left hand is above hip
        wrist_y = current_positions["left_wrist"][1]
        hip_y = current_positions["left_hip"][1]
        
        # Hand should be above hip level
        left_hand_proper_height = wrist_y < hip_y
        
        if left_hand_proper_height:
            hands_at_proper_height = True
    
    if ("right_wrist" in current_positions and "right_hip" in current_positions):
        # Same check for right hand
        wrist_y = current_positions["right_wrist"][1]
        hip_y = current_positions["right_hip"][1]
        
        right_hand_proper_height = wrist_y < hip_y
        
        if right_hand_proper_height:
            hands_at_proper_height = True
    
    metrics["hands_at_chest_level"] = hands_at_proper_height
    
    # If we have previous positions to compare with
    if len(hand_movement_history) > 0:
        prev_positions = hand_movement_history[-1]
        
        # Calculate movement for each tracked point
        left_movement = 0
        right_movement = 0
        
        if "left_wrist" in current_positions and "left_wrist" in prev_positions:
            left_movement = np.hypot(
                current_positions["left_wrist"][0] - prev_positions["left_wrist"][0],
                current_positions["left_wrist"][1] - prev_positions["left_wrist"][1]
            )
            
        if "right_wrist" in current_positions and "right_wrist" in prev_positions:
            right_movement = np.hypot(
                current_positions["right_wrist"][0] - prev_positions["right_wrist"][0],
                current_positions["right_wrist"][1] - prev_positions["right_wrist"][1]
            )
            
        # Update metrics
        metrics["left_hand_movement"] = float(left_movement)
        metrics["right_hand_movement"] = float(right_movement)
        metrics["total_movement"] = float(left_movement + right_movement)
        
        # Calculate symmetry (how evenly both hands are being used)
        if left_movement + right_movement > 0:
            metrics["movement_symmetry"] = float(
                1.0 - abs(left_movement - right_movement) / (left_movement + right_movement)
            )
            
        # Determine dominant hand
        if left_movement > right_movement * 1.5:
            metrics["dominant_hand"] = "left"
        elif right_movement > left_movement * 1.5:
            metrics["dominant_hand"] = "right"
        else:
            metrics["dominant_hand"] = "both"
    
    # Add current positions to history
    hand_movement_history.append(current_positions)
    if len(hand_movement_history) > window_size:
        hand_movement_history.popleft()
    
    # Analyze movement patterns over the window
    if len(hand_movement_history) >= window_size // 2:
        # Calculate variance in hand height (y-coordinate)
        height_values = []
        
        for positions in hand_movement_history:
            for hand in ["left_wrist", "right_wrist"]:
                if hand in positions:
                    height_values.append(positions[hand][1])
        
        if height_values:
            metrics["hand_height_variance"] = float(np.var(height_values))
        
        # Calculate average movement over the window
        total_movements = []
        total_left_movement = 0
        total_right_movement = 0
        movement_count = 0
        
        for i in range(1, len(hand_movement_history)):
            prev = hand_movement_history[i-1]
            curr = hand_movement_history[i]
            movement = 0
            
            # Track cumulative hand movements
            if "left_wrist" in curr and "left_wrist" in prev:
                left_move = np.hypot(
                    curr["left_wrist"][0] - prev["left_wrist"][0],
                    curr["left_wrist"][1] - prev["left_wrist"][1]
                )
                movement += left_move
                total_left_movement += left_move
            
            if "right_wrist" in curr and "right_wrist" in prev:
                right_move = np.hypot(
                    curr["right_wrist"][0] - prev["right_wrist"][0],
                    curr["right_wrist"][1] - prev["right_wrist"][1]
                )
                movement += right_move
                total_right_movement += right_move
            
            total_movements.append(movement)
            movement_count += 1
        
        avg_movement = np.mean(total_movements) if total_movements else 0
        
        # Update dominant hand across the window
        if movement_count > 0:
            if total_left_movement > total_right_movement * 1.3:
                metrics["dominant_hand"] = "left"
            elif total_right_movement > total_left_movement * 1.3:
                metrics["dominant_hand"] = "right"
            else:
                metrics["dominant_hand"] = "both"
        
        # SIMPLIFIED LOGIC: Determine if using gestures and their quality
        if avg_movement < 2.5:  # Very little movement
            metrics["is_using_gestures"] = False
            metrics["gesture_quality"] = "none"
        else:
            metrics["is_using_gestures"] = True
            
            # Evaluate based on movement patterns and hand position
            if not hands_at_proper_height or avg_movement > 50:  # Wrong position or too much movement
                metrics["gesture_quality"] = "poor"
            else:
                metrics["gesture_quality"] = "good"
    
    return metrics

def analyze_video(video_path, output_path, max_head_threshold=110, min_head_threshold=90, shoulder_threshold=20, 
                 spine_threshold=171, gesture_analysis=True, visualize=True, precise_output_path=None):
    """
    Analyze the video for posture issues and hand gestures
    
    Args:
        video_path: Path to the input video
        output_path: Path to save the JSON output
        max_head_threshold: Maximum threshold for head tilt in degrees (above this is an issue)
        min_head_threshold: Minimum threshold for head tilt in degrees (below this is an issue)
        shoulder_threshold: Threshold for shoulder tilt in pixels
        spine_threshold: Threshold for spine angle in degrees (below this is an issue - indicates bent spine)
        gesture_analysis: Whether to analyze hand gestures
        visualize: Whether to display the video with landmarks during processing
        precise_output_path: Path to save the precise summary JSON (if None, no precise summary is generated)
    """
    cap = cv2.VideoCapture(video_path)
    
    # Get video properties
    fps = float(cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = float(frame_count / fps)
    
    # Prepare output data
    analysis_results = {
        "video_info": {
            "path": video_path,
            "duration_seconds": float(duration),
            "fps": float(fps),
            "total_frames": int(frame_count)
        },
        "thresholds": {
            "max_head_tilt_degrees": float(max_head_threshold),
            "min_head_tilt_degrees": float(min_head_threshold),
            "shoulder_tilt_pixels": float(shoulder_threshold),
            "spine_angle_degrees": float(spine_threshold)
        },
        "head_tilt_issues": [],
        "shoulder_tilt_issues": [],
        "spine_angle_issues": [],
        "gesture_analysis": {
            "segments": [],
            "overall_assessment": {},
            "hand_dominance": {  # Added hand dominance tracking
                "left": 0,
                "right": 0,
                "both": 0,
                "primary_hand": "none"
            }
        }
    }
    
    # For tracking consecutive frames with issues
    current_head_issue = None
    current_shoulder_issue = None
    current_spine_issue = None
    current_gesture_segment = None
    
    # For tracking gesture patterns
    hand_movement_history = deque(maxlen=60)  # About 2 seconds at 30fps
    gesture_segment_min_duration = 3  # Minimum seconds for a gesture segment
    
    # For overall statistics
    total_frames_analyzed = 0
    frames_with_good_gestures = 0
    frames_with_poor_gestures = 0
    frames_with_no_gestures = 0
    
    # For tracking hand dominance
    frames_with_left_hand = 0
    frames_with_right_hand = 0
    frames_with_both_hands = 0
    
    # For tracking issue statistics
    frames_with_head_tilt_up = 0  # Head tilt > max_head_threshold
    frames_with_head_tilt_down = 0  # Head tilt < min_head_threshold
    frames_with_shoulder_tilt = 0
    frames_with_spine_angle = 0
    
    # Setup visualization window if needed
    if visualize:
        cv2.namedWindow('Presentation Analysis', cv2.WINDOW_NORMAL)
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        frame_idx = 0
        
        while cap.isOpened():
            success, img = cap.read()
            if not success:
                break
                
            # Convert the image and process with MediaPipe
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = pose.process(img_rgb)
            
            # If pose detected
            if results.pose_landmarks:
                total_frames_analyzed += 1
                
                # Calculate posture metrics
                head_tilt, shoulder_tilt = getPosture(results, img)
                spine_angle = getSpineAngle(results, img)
                
                # Current timestamp
                timestamp = float(frame_idx / fps)
                timestamp_str = str(timedelta(seconds=int(timestamp)))
                
                # Check for head tilt issues - consider min_head_threshold to max_head_threshold degrees as normal
                head_tilt_issue = head_tilt > max_head_threshold or head_tilt < min_head_threshold
                
                # Track specific issue types for precise summary
                if head_tilt > max_head_threshold:
                    frames_with_head_tilt_up += 1
                elif head_tilt < min_head_threshold:
                    frames_with_head_tilt_down += 1
                
                if shoulder_tilt > shoulder_threshold:
                    frames_with_shoulder_tilt += 1
                
                # Check for spine angle issues - spine_angle < threshold indicates bent spine
                if spine_angle < spine_threshold:
                    frames_with_spine_angle += 1
                    if current_spine_issue is None:
                        current_spine_issue = {
                            "start_time": float(timestamp),
                            "start_time_str": timestamp_str,
                            "min_angle": float(spine_angle)  # Track minimum angle (most bent)
                        }
                    else:
                        current_spine_issue["min_angle"] = float(min(current_spine_issue.get("min_angle", float('inf')), spine_angle))
                elif current_spine_issue is not None:
                    current_spine_issue["end_time"] = float(timestamp)
                    current_spine_issue["end_time_str"] = timestamp_str
                    current_spine_issue["duration"] = float(current_spine_issue["end_time"] - current_spine_issue["start_time"])
                    analysis_results["spine_angle_issues"].append(current_spine_issue)
                    current_spine_issue = None
                
                if head_tilt_issue:
                    if current_head_issue is None:
                        current_head_issue = {
                            "start_time": float(timestamp),
                            "start_time_str": timestamp_str,
                            "max_tilt": float(head_tilt)
                        }
                    else:
                        current_head_issue["max_tilt"] = float(max(current_head_issue["max_tilt"], head_tilt))
                elif current_head_issue is not None:
                    current_head_issue["end_time"] = float(timestamp)
                    current_head_issue["end_time_str"] = timestamp_str
                    current_head_issue["duration"] = float(current_head_issue["end_time"] - current_head_issue["start_time"])
                    analysis_results["head_tilt_issues"].append(current_head_issue)
                    current_head_issue = None
                
                # Check for shoulder tilt issues
                # Check for shoulder tilt issues
                if shoulder_tilt > shoulder_threshold:
                    if current_shoulder_issue is None:
                        current_shoulder_issue = {
                            "start_time": float(timestamp),
                            "start_time_str": timestamp_str,
                            "max_tilt": float(shoulder_tilt)
                        }
                    else:
                        current_shoulder_issue["max_tilt"] = float(max(current_shoulder_issue["max_tilt"], shoulder_tilt))
                elif current_shoulder_issue is not None:
                    current_shoulder_issue["end_time"] = float(timestamp)
                    current_shoulder_issue["end_time_str"] = timestamp_str
                    current_shoulder_issue["duration"] = float(current_shoulder_issue["end_time"] - current_shoulder_issue["start_time"])
                    analysis_results["shoulder_tilt_issues"].append(current_shoulder_issue)
                    current_shoulder_issue = None
                
                # Gesture analysis
                if gesture_analysis:
                    gesture_metrics = getHandGestureMetrics(results, img, hand_movement_history)
                    
                    # Track frames with different gesture qualities
                    if gesture_metrics["gesture_quality"] == "good":
                        frames_with_good_gestures += 1
                    elif gesture_metrics["gesture_quality"] == "poor":
                        frames_with_poor_gestures += 1
                    elif gesture_metrics["gesture_quality"] == "none":
                        frames_with_no_gestures += 1
                    
                    # Track hand dominance
                    if gesture_metrics["dominant_hand"] == "left":
                        frames_with_left_hand += 1
                    elif gesture_metrics["dominant_hand"] == "right":
                        frames_with_right_hand += 1
                    elif gesture_metrics["dominant_hand"] == "both":
                        frames_with_both_hands += 1
                    
                    # Track gesture segments
                    if current_gesture_segment is None or current_gesture_segment["quality"] != gesture_metrics["gesture_quality"]:
                        # End previous segment if it exists and is long enough
                        if current_gesture_segment is not None:
                            segment_duration = timestamp - current_gesture_segment["start_time"]
                            if segment_duration >= gesture_segment_min_duration:
                                current_gesture_segment["end_time"] = float(timestamp)
                                current_gesture_segment["end_time_str"] = timestamp_str
                                current_gesture_segment["duration"] = float(segment_duration)
                                analysis_results["gesture_analysis"]["segments"].append(current_gesture_segment)
                        
                        # Start new segment
                        current_gesture_segment = {
                            "start_time": float(timestamp),
                            "start_time_str": timestamp_str,
                            "quality": gesture_metrics["gesture_quality"],
                            "avg_movement": float(gesture_metrics["total_movement"]),
                            "dominant_hand": gesture_metrics["dominant_hand"]  # Add dominant hand to segment
                        }
                    else:
                        # Update current segment
                        current_gesture_segment["avg_movement"] = float(
                            (current_gesture_segment["avg_movement"] * 
                             (frame_idx - int(current_gesture_segment["start_time"] * fps)) + 
                             gesture_metrics["total_movement"]) / 
                            (frame_idx - int(current_gesture_segment["start_time"] * fps) + 1)
                        )
                
                # Visualize if needed
                if visualize:
                    # Draw landmarks
                    annotated_img = img.copy()
                    mp_drawings.draw_landmarks(
                        annotated_img,
                        results.pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
                    )
                    
                    # Add text with metrics
                    head_tilt_color = (0, 255, 0) if min_head_threshold <= head_tilt <= max_head_threshold else (0, 0, 255)
                    
                    cv2.putText(annotated_img, f"Head Tilt: {head_tilt:.1f}", (10, 30), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, head_tilt_color, 2)
                    cv2.putText(annotated_img, f"Shoulder Tilt: {shoulder_tilt:.1f}", (10, 70), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if shoulder_tilt <= shoulder_threshold else (0, 0, 255), 2)
                    cv2.putText(annotated_img, f"Spine Angle: {spine_angle:.1f}", (10, 110), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if spine_angle >= spine_threshold else (0, 0, 255), 2)
                    
                    if gesture_analysis:
                        gesture_color = (0, 255, 0)  # Green for good
                        if gesture_metrics["gesture_quality"] == "none":
                            gesture_color = (0, 0, 255)  # Red for none
                        elif gesture_metrics["gesture_quality"] == "poor":
                            gesture_color = (0, 165, 255)  # Orange for poor
                        
                        cv2.putText(annotated_img, f"Gestures: {gesture_metrics['gesture_quality']}", (10, 150), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, gesture_color, 2)
                        
                        # Add dominant hand info
                        cv2.putText(annotated_img, f"Hand: {gesture_metrics['dominant_hand']}", (10, 190), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    
                    cv2.putText(annotated_img, f"Time: {timestamp_str}", (10, 230), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    
                    cv2.imshow('Presentation Analysis', annotated_img)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
            
            frame_idx += 1
            
            # Show progress
            if frame_idx % 30 == 0:
                percent_complete = (frame_idx / frame_count) * 100
                print(f"Processing: {percent_complete:.1f}% complete", end='\r')
    
    # Handle any issues still in progress at the end of the video
    timestamp = float(frame_idx / fps)
    timestamp_str = str(timedelta(seconds=int(timestamp)))
    
    # Finalize posture issues
    if current_head_issue is not None:
        current_head_issue["end_time"] = float(timestamp)
        current_head_issue["end_time_str"] = timestamp_str
        current_head_issue["duration"] = float(current_head_issue["end_time"] - current_head_issue["start_time"])
        analysis_results["head_tilt_issues"].append(current_head_issue)
    
    if current_shoulder_issue is not None:
        current_shoulder_issue["end_time"] = float(timestamp)
        current_shoulder_issue["end_time_str"] = timestamp_str
        current_shoulder_issue["duration"] = float(current_shoulder_issue["end_time"] - current_shoulder_issue["start_time"])
        analysis_results["shoulder_tilt_issues"].append(current_shoulder_issue)
    
    if current_spine_issue is not None:
        current_spine_issue["end_time"] = float(timestamp)
        current_spine_issue["end_time_str"] = timestamp_str
        current_spine_issue["duration"] = float(current_spine_issue["end_time"] - current_spine_issue["start_time"])
        analysis_results["spine_angle_issues"].append(current_spine_issue)
    
    # Finalize gesture segment
    if gesture_analysis and current_gesture_segment is not None:
        segment_duration = timestamp - current_gesture_segment["start_time"]
        if segment_duration >= gesture_segment_min_duration:
            current_gesture_segment["end_time"] = float(timestamp)
            current_gesture_segment["end_time_str"] = timestamp_str
            current_gesture_segment["duration"] = float(segment_duration)
            analysis_results["gesture_analysis"]["segments"].append(current_gesture_segment)
    
    # Calculate overall gesture assessment and hand dominance
    if gesture_analysis and total_frames_analyzed > 0:
        gesture_percentage_good = (frames_with_good_gestures / total_frames_analyzed) * 100
        gesture_percentage_none = (frames_with_no_gestures / total_frames_analyzed) * 100
        gesture_percentage_poor = (frames_with_poor_gestures / total_frames_analyzed) * 100
        
        # Update hand dominance statistics
        active_gesture_frames = frames_with_left_hand + frames_with_right_hand + frames_with_both_hands
        
        if active_gesture_frames > 0:
            left_percentage = (frames_with_left_hand / active_gesture_frames) * 100
            right_percentage = (frames_with_right_hand / active_gesture_frames) * 100
            both_percentage = (frames_with_both_hands / active_gesture_frames) * 100
            
            analysis_results["gesture_analysis"]["hand_dominance"] = {
                "left_percentage": float(left_percentage),
                "right_percentage": float(right_percentage),
                "both_percentage": float(both_percentage),
                "primary_hand": "none"
            }
            
            # Determine primary hand
            if left_percentage > 50 and left_percentage > right_percentage + 20:
                primary_hand = "left"
            elif right_percentage > 50 and right_percentage > left_percentage + 20:
                primary_hand = "right"
            elif both_percentage > 40:
                primary_hand = "both"
            else:
                primary_hand = "mixed"
                
            analysis_results["gesture_analysis"]["hand_dominance"]["primary_hand"] = primary_hand
        
        analysis_results["gesture_analysis"]["overall_assessment"] = {
            "frames_analyzed": total_frames_analyzed,
            "percentage_good_gestures": float(gesture_percentage_good),
            "percentage_poor_gestures": float(gesture_percentage_poor),
            "percentage_no_gestures": float(gesture_percentage_none),
            "assessment": ""
        }
        
        # Overall assessment
        if gesture_percentage_good > 60:
            assessment = "Excellent use of hand gestures throughout the presentation. "
        elif gesture_percentage_good > 40:
            assessment = "Good use of hand gestures during parts of the presentation. "
        elif gesture_percentage_good > 20:
            assessment = "Occasional effective use of hand gestures. "
        else:
            assessment = "Limited use of effective hand gestures. "
        
        if gesture_percentage_none > 60:
            assessment += "You appear stiff and stationary most of the time, which can make you appear nervous or unconfident. "
        elif gesture_percentage_none > 40:
            assessment += "There are significant periods where you're not using gestures at all. "
        
        if gesture_percentage_poor > 30:
            assessment += "Some of your gestures appeared awkward or unnatural. "
        
        # Add hand dominance assessment
        if active_gesture_frames > 0:
            if primary_hand == "left":
                assessment += "You predominantly use your left hand for gesturing. "
            elif primary_hand == "right":
                assessment += "You predominantly use your right hand for gesturing. "
            elif primary_hand == "both":
                assessment += "You effectively use both hands for gesturing. "
            else:
                assessment += "Your hand usage is mixed and inconsistent. "
        
        recommendations = "Recommendations: "
        
        if gesture_percentage_good < 40:
            recommendations += "Practice using more purposeful hand gestures to emphasize key points. "
        
        if gesture_percentage_none > 40:
            recommendations += "Try to be more animated and use your hands more naturally while speaking. "
        
        if active_gesture_frames > 0 and primary_hand != "both" and both_percentage < 30:
            recommendations += "Practice incorporating both hands more evenly in your gestures for more engaging presentations. "
        
        analysis_results["gesture_analysis"]["overall_assessment"]["assessment"] = assessment + recommendations
    
    # Generate precise summary if requested
    if precise_output_path and total_frames_analyzed > 0:
        precise_summary = {
            "video_info": analysis_results["video_info"],
            "thresholds": analysis_results["thresholds"],
            "frame_statistics": {
                "total_frames_analyzed": total_frames_analyzed,
                "head_tilt_up_percentage": float((frames_with_head_tilt_up / total_frames_analyzed) * 100),
                "head_tilt_down_percentage": float((frames_with_head_tilt_down / total_frames_analyzed) * 100),
                "shoulder_tilt_percentage": float((frames_with_shoulder_tilt / total_frames_analyzed) * 100),
                "spine_angle_percentage": float((frames_with_spine_angle / total_frames_analyzed) * 100)
            }
        }
        
        # Add gesture statistics if analyzed
        if gesture_analysis:
            precise_summary["gesture_statistics"] = {
                "good_gestures_percentage": float((frames_with_good_gestures / total_frames_analyzed) * 100),
                "poor_gestures_percentage": float((frames_with_poor_gestures / total_frames_analyzed) * 100),
                "no_gestures_percentage": float((frames_with_no_gestures / total_frames_analyzed) * 100)
            }
            
            # Add hand dominance statistics
            active_gesture_frames = frames_with_left_hand + frames_with_right_hand + frames_with_both_hands
            if active_gesture_frames > 0:
                precise_summary["hand_dominance"] = {
                    "left_hand_percentage": float((frames_with_left_hand / active_gesture_frames) * 100),
                    "right_hand_percentage": float((frames_with_right_hand / active_gesture_frames) * 100),
                    "both_hands_percentage": float((frames_with_both_hands / active_gesture_frames) * 100)
                }
        # Save precise summary to JSON
        
        print(f"Precise summary saved to {precise_output_path}")
    
    # Cleanup
    cap.release()
    if visualize:
        cv2.destroyAllWindows()
    
    # Save to JSON using the custom encoder
    
    print(f"\nAnalysis complete! Results saved to {output_path}")
    
    return json.dumps(precise_summary, cls=NumpyEncoder)

def getPostureFeatures(video_path, output='results.json', precise_output='precise_summary.json',
         max_head_threshold=110, min_head_threshold=90, shoulder_threshold=20, spine_threshold=171,
         no_gesture=False, visualize=False):
    """Run analysis with given parameters"""
    output = analyze_video(
        video_path, 
        output, 
        max_head_threshold,
        min_head_threshold,
        shoulder_threshold, 
        spine_threshold, 
        not no_gesture,
        visualize,
        precise_output
    )
    print(output)
    return output
# if __name__ == "__main__":
#     getPostureFeatures(r'C:\BITSH\audio\video4.mp4')