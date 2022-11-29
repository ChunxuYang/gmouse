export type ImuDataType = {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
};

export type BatchType = ImuDataType[];

export type SampleSetType = {
  id: string;
  class: {
    label: string;
    value: number;
  };
  samples: BatchType[];
};
