import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { JaegerExporter } from "@opentelemetry/exporter-jaeger"
import { Resource } from "@opentelemetry/resources"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"
import { propagation } from "@opentelemetry/api"
import { W3CTraceContextPropagator } from "@opentelemetry/core"
import { registerInstrumentations } from "@opentelemetry/instrumentation"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"

propagation.setGlobalPropagator(new W3CTraceContextPropagator())

const jaegerExporter = new JaegerExporter({
  host: process.env.JAEGER_HOST || "localhost",
  port: parseInt(process.env.JAEGER_PORT || "6832", 10),
})
const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        process.env.TRACING_SERVICE_NAME || "galoy-dev",
    }),
  ),
})
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter))
provider.register()

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
})
