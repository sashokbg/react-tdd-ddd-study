import {DescriptionModel} from "@/model/description-model";
import {LocaleEnum} from "@/model/locale.enum";
import React, {useRef} from "react";
import {BlockComponent} from "@/shared/block";
import styles from '../styles/Home.module.css'
import {generateFakeContent} from "@/shared/content-service";


const description = new DescriptionModel()

description.callback = (run_id: string, locale: LocaleEnum, block_name: string) => {
  console.log(`Run id ${run_id}, locale ${locale}, block name ${block_name}`);
}

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null)

  const generateContent = () => {
    generateFakeContent(description)
  }

  const changeLocale = () => {
    if (formRef.current) {
      let formData = new FormData(formRef.current);

      description.changeLocale(formData.get('locale') as LocaleEnum);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>Content is loading: {description.isLoading.value ? 'True' : 'False'}</div>

        {description.getCurrentLocaleContent().value?.blocks.value.map((block) => {
          return (<BlockComponent key={block.name} block={block}/>)
        })}

        <form ref={formRef}>
          <label htmlFor='locale'>Language</label>
          <select name={'locale'} onChange={changeLocale} id='locale'>
            <option>en_US</option>
            <option>fr_FR</option>
            <option>en_UK</option>
          </select>
        </form>

        <button onClick={generateContent}>Generate Content</button>
      </div>
    </div>
  );
}
