import {Block} from "@/model/block";
import styles from '../styles/block.module.css'

type BlockComponentProps = {
  block: Block
}

export const BlockComponent = (props: BlockComponentProps) => {

  return (
    <div className={styles.block}>
      <div>
        <b>{props.block.displayTitle}</b>
      </div>
      <div className={styles.content}>
        {props.block.content.value}
      </div>
    </div>
  )

}
