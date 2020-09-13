import numpy as np
import imutils
import time
import cv2
import threading

class TaskThread(threading.Thread):
    
    def __init__(self, videoDir, outputDir):
        super().__init__()
        self.videoDir = videoDir
        self.outputDir = outputDir
        self.progress = 0
        self.done = False
        self.writer = cv2.VideoWriter(self.outputDir, cv2.VideoWriter_fourcc(*'mp4v'), 25, (frame.shape[1], frame.shape[0]), True)

    def run(self):
        
        labelsPath = "mask-rcnn-coco/object_detection_classes_coco.txt"
        
        LABELS = open(labelsPath).read().strip().split("\n")
        
        np.random.seed(42)
        COLORS = np.random.randint(0, 255, size=(len(LABELS), 3),
        	dtype="uint8")
        
        weightsPath = "mask-rcnn-coco/frozen_inference_graph.pb"
        configPath = "mask-rcnn-coco/mask_rcnn_inception_v2_coco_2018_01_28.pbtxt"
        
        net = cv2.dnn.readNetFromTensorflow(weightsPath, configPath)
        
        vs = cv2.VideoCapture(self.videoDir)
        
        total = int(vs.get(cv2.cv.CV_CAP_PROP_FRAME_COUNT))
            
        count = 1
            
        #maximum 15 frames
        while count <= min(15, total):

        	ret, frame = vs.read()

        	if not ret:
        		break

        	blob = cv2.dnn.blobFromImage(frame, swapRB=True, crop=False)
        	net.setInput(blob)

        	(boxes, masks) = net.forward(["detection_out_final", "detection_masks"])

        	for i in range(0, boxes.shape[2]):

        		classID = int(boxes[0, 0, i, 1])
        		confidence = boxes[0, 0, i, 2]

        		if confidence > 0.6:

        			(H, W) = frame.shape[:2]
        			box = boxes[0, 0, i, 3:7] * np.array([W, H, W, H])
        			(startX, startY, endX, endY) = box.astype("int")
        			boxW = endX - startX
        			boxH = endY - startY

        			mask = masks[i, classID]
        			mask = cv2.resize(mask, (boxW, boxH),
        				interpolation=cv2.INTER_NEAREST)
        			mask = (mask > 0.3)

        			roi = frame[startY:endY, startX:endX][mask]

        			color = COLORS[classID]
        			blended = ((0.4 * color) + (0.6 * roi)).astype("uint8")

        			frame[startY:endY, startX:endX][mask] = blended

        			color = [int(c) for c in color]
        			cv2.rectangle(frame, (startX, startY), (endX, endY),
        				color, 2)

        			text = "{}: {:.4f}".format(LABELS[classID], confidence)
        			cv2.putText(frame, text, (startX, startY - 5),
        				cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                    
        	self.writer.write(frame)
        	self.progress = int(count * 100/ min(total, 15))
        	count += 1
            
        self.writer.release()
        vs.release()
        
        self.done = True
