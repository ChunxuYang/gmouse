/**
 * use tensorflowjs knn to determine the imu gesture
 * data: {ax, ay, az, gx, gy, gz}[100]
 * return: {type, confidence}
 * type: 0 - 7
 * confidence: 0 - 1
 * 0: no gesture
 * 1: up
 * 2: down
 * 3: left
 * 4: right
 * 7: click
 */

import * as tf from "@tensorflow/tfjs";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { BatchType, SampleSetType } from "../../types/data-type";

class KNN {
  // ts variables
  private classifier: knnClassifier.KNNClassifier;

  private prediction_available = true;

  private timer: NodeJS.Timeout;

  constructor() {
    this.classifier = knnClassifier.create();
  }

  // padding the data to 100
  padding(data: BatchType) {
    if (data.length > 100) {
      return data.slice(0, 100);
    }
    const paddingData = new Array(100 - data.length).fill({
      ax: 0,
      ay: 0,
      az: 0,
      gx: 0,
      gy: 0,
      gz: 0,
    });
    return data.concat(paddingData);
  }

  // add data to knn
  addExample(data: BatchType, type: number) {
    try {
      data = this.padding(data);
      const tensor = tf.tensor2d(
        data.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
      );
      this.classifier.addExample(tensor, type);
      return true;
    } catch (e) {
      return false;
    }
  }

  // change one example label
  changeExample(data: BatchType, type: number, otherData: BatchType[]) {
    try {
      data = this.padding(data);
      const tensor = tf.tensor2d(
        data.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
      );
      this.classifier.clearClass(type);
      this.classifier.addExample(tensor, type);
      otherData.forEach((d) => {
        d = this.padding(d);
        const tensor = tf.tensor2d(
          d.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
        );
        this.classifier.addExample(tensor, type);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  // delete a sample set
  deleteSampleSet(type: number) {
    try {
      this.classifier.clearClass(type);
      return true;
    } catch (e) {
      return false;
    }
  }

  // refresh the knn
  refreshAllClasses(data: SampleSetType[]) {
    this.classifier.clearAllClasses();
    data.forEach((d) => {
      d.samples.forEach((s) => {
        s = this.padding(s);
        const tensor = tf.tensor2d(
          s.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
        );
        this.classifier.addExample(tensor, d.class.value);
      });
    });

    console.log(this.classifier.getClassExampleCount());
  }

  // predict the gesture
  async predict(data: BatchType) {
    if (this.prediction_available) {
      this.prediction_available = false;

      // turn the prediction available back to true after 100ms
      this.timer = setTimeout(() => {
        this.prediction_available = true;
      }, 1000);

      data = this.padding(data);
      const tensor = tf.tensor2d(
        data.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
      );

      try {
        const result = await this.classifier.predictClass(tensor);
        console.log(this.classifier.getClassExampleCount());
        console.log(result);

        return {
          type: result.label,
          confidence: result.confidences[result.label],
        };
      } catch (e) {
        console.log(e);
        return {
          type: "error",
          confidence: e.message,
        };
      }
    } else {
      return {
        type: "error",
        confidence: "prediction not available",
      };
    }
  }

  // add a new sample set
  addSampleSet(data: BatchType[], type: number) {
    try {
      data.forEach((d) => {
        d = this.padding(d);
        const tensor = tf.tensor2d(
          d.map((d) => [d.ax, d.ay, d.az, d.gx, d.gy, d.gz])
        );
        this.classifier.addExample(tensor, type);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  // clear all data
  clear() {
    this.classifier.clearAllClasses();
  }

  clearClass(type: number) {
    this.classifier.clearClass(type);
  }
}

const model = new KNN();

export default model;
