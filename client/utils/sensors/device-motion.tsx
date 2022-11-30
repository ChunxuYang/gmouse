import { DeviceMotion } from "expo-sensors";

import { useState, useEffect } from "react";

export default function useDeviceMotion() {
  const [data, setData] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 },
  });

  const [orignalPointing, setOriginalPointing] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const [relativePointing, setRelativePointing] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(100);
  }, []);

  useEffect(() => {
    setRelativePointing({
      alpha: -data.rotation.alpha + orignalPointing.alpha,
      beta: -data.rotation.beta - orignalPointing.beta,
      gamma: -data.rotation.gamma - orignalPointing.gamma,
    });
  }, [data, orignalPointing]);

  const _subscribe = () => {
    setSubscription(
      DeviceMotion.addListener((deviceMotionData) => {
        setData(deviceMotionData);
      })
    );
  };

  const _unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  const setOriginal = () => {
    // use the current pointing as the original pointing
    setOriginalPointing({
      alpha: data.rotation.alpha,
      beta: data.rotation.beta,
      gamma: data.rotation.gamma,
    });
  };

  return {
    data,
    startDeviceMotion: _subscribe,
    stopDeviceMotion: _unsubscribe,
    pointing: relativePointing,
    setOriginalPointing: setOriginal,
  };
}
