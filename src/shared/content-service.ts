import {DescriptionModel} from "@/model/description-model";
import {LocaleEnum} from "@/model/locale.enum";

export async function generateFakeContent(description: DescriptionModel) {
  if(description.currentLocale.value === LocaleEnum.fr_FR) {
    await generate("Ceci est un titre !", "title", description, true);
    await generate("La description courte de l'article.", "short_description", description, true);
    await generate("La description longue, constituée de deux phrases. La seconde phrase.", "long_description", description, true);
  } else {
    await generate("This is a title !", "title", description, true);
    await generate("This is the short description of the article.", "short_description", description, true);
    await generate("And this is a long description of multiple phrases. Phrase 2", "long_description", description, true);
  }
}

export function generate(text: string, block: string, description: DescriptionModel, isFirst: boolean, parentResolve: any = undefined) {
  return new Promise((resolve, reject) => {
    const firstElement = text.split(' ')[0];

    if (isFirst) {
      description.addStartChunk({
        name: block,
        display_title: block,
        level: 0,
        is_content_display_title: false,
        locale: description.currentLocale.value
      })
    }

    description.addChunk({
      block_name: block,
      locale: description.currentLocale.value,
      chunk: firstElement + ' '
    })

    if (text.split(' ').length > 1) {
      setTimeout(async () => {
        generate(text.substring(text.indexOf(' ') + 1), block, description, false, resolve)
          .then(() => resolve(true))
      }, 100)
    } else {
      description.onContentFinished();
      resolve(true);
    }
  })
}

