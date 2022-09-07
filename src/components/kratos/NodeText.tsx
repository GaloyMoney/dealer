import { UiText, UiNode, UiNodeTextAttributes } from "@ory/client"
import { CodeBox, P } from "@ory/themes"

interface Props {
  node: UiNode
  attributes: UiNodeTextAttributes
}

const Content = ({ attributes }: Props) => {
  switch (attributes.text.id) {
    case 1050015: {
      // This text node contains lookup secrets. Let's make them a bit more beautiful!
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secrets = (attributes.text.context as any).secrets.map(
        (text: UiText, index: number) => (
          <div
            key={index}
            data-testid={`node/text/${attributes.id}/lookup_secret`}
            className="col-xs-3"
          >
            {/* Used lookup_secret has ID 1050014 */}
            <code>{text.id === 1050014 ? "Used" : text.text}</code>
          </div>
        ),
      )
      return (
        <div className="container-fluid" data-testid={`node/text/${attributes.id}/text`}>
          <div className="row">{secrets}</div>
        </div>
      )
    }
  }

  return (
    <div data-testid={`node/text/${attributes.id}/text`}>
      <CodeBox code={attributes.text.text} />
    </div>
  )
}

export const NodeText = ({ node, attributes }: Props) => {
  return (
    <>
      <P data-testid={`node/text/${attributes.id}/label`}>{node.meta?.label?.text}</P>
      <Content node={node} attributes={attributes} />
    </>
  )
}
