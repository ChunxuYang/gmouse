import { Accelerometer, Gyroscope } from "expo-sensors";

import { useState, useEffect } from "react";

/**
 * this hook will return the current accelerometer and gyroscope data
 * @returns {Object} {ax, ay, az, gx, gy, gz}
 */
export default function useIMU() {
  const [{ ax, ay, az }, setAccelerometer] = useState({ ax: 0, ay: 0, az: 0 });
  const [{ gx, gy, gz }, setGyroscope] = useState({ gx: 0, gy: 0, gz: 0 });

  const [subscription, setSubscription] = useState<{
    accelerometer: any;
    gyroscope: any;
  }>({
    accelerometer: null,
    gyroscope: null,
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
  }, []);

  const _subscribe = () => {
    setSubscription({
      accelerometer: Accelerometer.addListener((accelerometerData) => {
        setAccelerometer({
          ax: accelerometerData.x,
          ay: accelerometerData.y,
          az: accelerometerData.z,
        });
      }),
      gyroscope: Gyroscope.addListener((gyroscopeData) => {
        setGyroscope({
          gx: gyroscopeData.x,
          gy: gyroscopeData.y,
          gz: gyroscopeData.z,
        });
      }),
    });
  };

  const _unsubscribe = () => {
    if (subscription.accelerometer && subscription.gyroscope) {
      subscription.accelerometer.remove();
      subscription.gyroscope.remove();
      setSubscription({
        accelerometer: null,
        gyroscope: null,
      });
    }
  };

  return {
    data: { ax, ay, az, gx, gy, gz },
    startSubscription: _subscribe,
    stopSubscription: _unsubscribe,
  };
}
