import {Block} from "@/model/block";

type BlockComponentProps = {
  block: Block
}

export const BlockComponent = (props: BlockComponentProps) => {

  return (
    <>
      Block:

      {props.block.content.value}

    </>
  )

}
