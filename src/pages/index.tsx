import {DescriptionModel} from "@/model/description-model";
import {LocaleEnum} from "@/model/locale.enum";
import React, {useRef} from "react";
import {BlockComponent} from "@/shared/block";
import styles from '../styles/Home.module.css'
import 'preact/debug';
import {effect} from "@preact/signals-react";


const description = new DescriptionModel("123", () => {
})


export default function Home() {
  const isLoading = description.isLoading.value
  const formRef = useRef<HTMLFormElement>(null)

  const addBlock = () => {
    if (formRef.current) {
      let formData = new FormData(formRef.current)

      description.addStartChunk({
        name: formData.get('block_title') as string,
        display_title: "Title",
        level: 0,
        is_content_display_title: false,
        locale: formData.get('locale') as LocaleEnum,
      })
    }
  }

  const addContent = () => {
    if (formRef.current) {
      let formData = new FormData(formRef.current)

      description.addChunk({
        block_name: "title",
        locale: formData.get('locale') as LocaleEnum,
        chunk: formData.get('chunk_content') as string
      })
    }
  }

  const changeLocale = () => {
    if (formRef.current) {
      let formData = new FormData(formRef.current);

      description.changeLocale(formData.get('locale') as LocaleEnum);
    }
  }

  effect(() => {
    console.log("TEST", description.getCurrentLocaleContent().value)
  })

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <div>Content is loading: {isLoading ? 'T' : 'F'}</div>

          {description.getCurrentLocaleContent().value?.blocks.value.map((block) => {
            return (<BlockComponent key={block.name} block={block}/>)
          })}

        </div>
        <div className={styles.controls}>
          <form ref={formRef}>
            <select name={'locale'} onChange={changeLocale}>
              <option>en_US</option>
              <option>fr_FR</option>
              <option>en_UK</option>
            </select>

            <label>Block title</label>
            <input name={'block_title'}/>

            <label></label>
            <input name={'chunk_content'}/>
          </form>

          <button onClick={addBlock}>Add Block</button>
          <button onClick={addContent}>Add Content</button>
          <button onClick={changeLocale}>Change Locale</button>
        </div>
      </div>
    </>
  );
}
