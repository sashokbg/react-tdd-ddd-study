import {LocaleEnum} from "@/model/locale.enum";
import {DescriptionModel} from "@/model/description-model";

export const fakeContent = (description: DescriptionModel) => {

  description.addStartChunk({
    name: 'title',
    display_title: 'Title',
    level: 0,
    is_content_display_title: false,
    locale: description.currentLocale.value
  })

  "A product title".split(' ').forEach((element, index) => {
    setTimeout(() => {
      description.addChunk({
        block_name: 'title',
        locale: description.currentLocale.value,
        chunk: element + ' '
      })
    }, index * 150)
  })

  description.addStartChunk({
    name: 'short_description',
    display_title: 'Short Description',
    level: 0,
    is_content_display_title: false,
    locale: description.currentLocale.value
  })

  "This is the short description for our product. It is usually made of two phrases.".split(' ').forEach((element, index) => {
    setTimeout(() => {
      description.addChunk({
        block_name: 'short_description',
        locale: description.currentLocale.value,
        chunk: element + ' '
      })
    }, index * 150)
  })

}
