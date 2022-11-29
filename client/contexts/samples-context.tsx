import * as React from "react";
import { BatchType, SampleSetType } from "../types/data-type";
import model from "../utils/knn";

const { createContext, useContext } = React;

export type SampleContextType = {
  sampleSets: SampleSetType[];
  addSampleSet: (sampleSet: SampleSetType) => void;
  addSample: (sample: BatchType, setId: string) => void;
  setSampleSet(setId: string, sampleSet: Partial<SampleSetType>): void;
  deleteSampleSet(setId: string): void;
};

export const SampleContext = createContext<SampleContextType>({
  sampleSets: [],
  addSampleSet: () => {},
  addSample: () => {},
  setSampleSet: () => {},
  deleteSampleSet: () => {},
});

export const useSampleContext = () => useContext(SampleContext);

export const SampleProvider = ({ children }: { children: React.ReactNode }) => {
  const [sampleSets, setSampleSets] = React.useState<SampleSetType[]>([]);

  const addSampleSet = (sampleSet: SampleSetType) => {
    model.addSampleSet(sampleSet.samples, sampleSet.class.value);
    setSampleSets([...sampleSets, sampleSet]);
  };

  const addSample = (sample: BatchType, setId: string) => {
    const newSampleSets = [...sampleSets];
    const index = newSampleSets.findIndex((set) => set.id === setId);
    newSampleSets[index].samples.push(sample);
    model.addExample(sample, newSampleSets[index].class.value);
    setSampleSets(newSampleSets);
  };

  const setSampleSet = (setId: string, sampleSet: Partial<SampleSetType>) => {
    const newSampleSets = [...sampleSets];
    const index = newSampleSets.findIndex((set) => set.id === setId);

    if (sampleSet.class && (sampleSet.samples?.length || 0) > 0) {
      const newClassValue = sampleSet.class.value;
      const oldClassValue = newSampleSets[index].class.value;
      if (oldClassValue !== newClassValue) {
        model.clearClass(oldClassValue);
        newSampleSets[index].samples.forEach((sample) => {
          model.addExample(sample, newClassValue);
        });
      }
    }

    newSampleSets[index] = {
      ...newSampleSets[index],
      ...sampleSet,
    };
    setSampleSets(newSampleSets);
  };

  const deleteSampleSet = (setId: string) => {
    const newSampleSets = [...sampleSets];
    const index = newSampleSets.findIndex((set) => set.id === setId);
    if (newSampleSets[index].samples.length > 0) {
      model.clearClass(newSampleSets[index].class.value);
    }
    newSampleSets.splice(index, 1);
    setSampleSets(newSampleSets);
  };

  return (
    <SampleContext.Provider
      value={{
        sampleSets,
        addSampleSet,
        addSample,
        setSampleSet,
        deleteSampleSet,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
