import cv2
import numpy as np

# Character sets from light → dark
CHARSETS = [
    " .:-=+*#%@",
    " .`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    " .oO0@",
    " ░▒▓█"
]

charset_index = 1
invert = False
scale = 8

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Camera could not be opened.")
    exit()

print("""
LIVE ASCII CAMERA

Q = Quit
+ = More detail
- = Less detail
C = Change character style
I = Invert
R = Reset
""")

while True:

    ret, frame = cap.read()

    if not ret:
        break

    # Mirror webcam
    frame = cv2.flip(frame, 1)

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Resize
    height, width = gray.shape

    new_width = max(20, width // scale)

    # Characters are usually taller than they are wide,
    # so compensate for terminal/canvas proportions.
    new_height = max(10, int(height / scale * 0.45))

    small = cv2.resize(
        gray,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA
    )

    if invert:
        small = 255 - small

    chars = CHARSETS[charset_index]

    # Convert pixels → characters
    result = []

    for row in small:

        line = ""

        for pixel in row:

            index = int(pixel / 256 * len(chars))

            if index >= len(chars):
                index = len(chars) - 1

            line += chars[index]

        result.append(line)

    # Create black image
    canvas_height = new_height * 12
    canvas_width = new_width * 8

    canvas = np.zeros(
        (canvas_height, canvas_width, 3),
        dtype=np.uint8
    )

    # Draw characters
    for y, line in enumerate(result):

        for x, char in enumerate(line):

            if char != " ":

                cv2.putText(
                    canvas,
                    char,
                    (x * 8, (y + 1) * 12),
                    cv2.FONT_HERSHEY_PLAIN,
                    0.75,
                    (255, 255, 255),
                    1,
                    cv2.LINE_AA
                )

    cv2.imshow("LIVE ASCII PORTRAIT", canvas)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

    elif key == ord("+") or key == ord("="):
        scale = max(2, scale - 1)

    elif key == ord("-") or key == ord("_"):
        scale = min(20, scale + 1)

    elif key == ord("c"):
        charset_index = (charset_index + 1) % len(CHARSETS)

    elif key == ord("i"):
        invert = not invert

    elif key == ord("r"):
        scale = 8
        charset_index = 1
        invert = False


cap.release()
cv2.destroyAllWindows()