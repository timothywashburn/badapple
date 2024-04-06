import os
import cv2
import numpy as np
import json

input_file = 'dev/【東方】Bad Apple!! ＰＶ【影絵】.mp4'
# input_file = 'dev/test.mp4'
output_file = 'video_data.json'
capture = cv2.VideoCapture(input_file)
total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

if os.path.exists(output_file):
    print(f"Error: Output file '{output_file}' already exists.")
    exit()

output_width = 53
output_height = 40
scalar = 9

video_data = []

count = 0
while capture.isOpened():
    # if count == 1:
    #     break
    count += 1
    print(f'attempting to read frame {count}/{total_frames}')

    has_frame, frame = capture.read()
    if not has_frame:
        print('out of frames')
        break

    height, width, _ = frame.shape
    cropped_frame = frame[:height, 1:width - 2]
    height, width, _ = cropped_frame.shape
    grayscale = cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2GRAY)

    frame_data = []

    for y in range(0, height, scalar):
        row = []
        for x in range(0, width, scalar):
            cell = grayscale[y:y + scalar, x:x + scalar]
            brightness_avg = round(np.mean(cell) / 64)
            row.append(brightness_avg)
        frame_data.append(row)

    video_data.append(frame_data)

capture.release()

with open('video_data.json', 'w') as f:
    json.dump(video_data, f, separators=(',', ':'), ensure_ascii=False)
