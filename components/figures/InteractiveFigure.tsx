import type { FigureKind } from "@/types";
import { BatchThroughputSimulator } from "@/components/figures/BatchThroughputSimulator";
import { InferenceLatencySimulator } from "@/components/figures/InferenceLatencySimulator";
import { KVCacheVisualizer } from "@/components/figures/KVCacheVisualizer";
import { LossCurveVisualizer } from "@/components/figures/LossCurveVisualizer";
import { PipelineDiagram } from "@/components/figures/PipelineDiagram";
import { RAGFlowVisualizer } from "@/components/figures/RAGFlowVisualizer";
import { TokenPredictionVisualizer } from "@/components/figures/TokenPredictionVisualizer";
import { TrainingStepVisualizer } from "@/components/figures/TrainingStepVisualizer";

type InteractiveFigureProps = {
  kind: FigureKind;
};

export function InteractiveFigure({ kind }: InteractiveFigureProps) {
  return (
    <div className="panel panel-pad">
      {kind === "pipeline" ? <PipelineDiagram /> : null}
      {kind === "tokenPrediction" ? <TokenPredictionVisualizer /> : null}
      {kind === "lossCurve" ? <LossCurveVisualizer /> : null}
      {kind === "trainingStep" ? <TrainingStepVisualizer /> : null}
      {kind === "ragFlow" ? <RAGFlowVisualizer /> : null}
      {kind === "inferenceLatency" ? <InferenceLatencySimulator /> : null}
      {kind === "kvCache" ? <KVCacheVisualizer /> : null}
      {kind === "batchThroughput" ? <BatchThroughputSimulator /> : null}
    </div>
  );
}
