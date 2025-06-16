import { Mark, mergeAttributes } from '@tiptap/core'

export interface FontFamilyOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType
      unsetFontFamily: () => ReturnType
    }
  }
}

export const FontFamily = Mark.create<FontFamilyOptions>({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontFamily) {
            return {}
          }
          return {
            style: `font-family: ${attributes.fontFamily}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        style: 'font-family',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setFontFamily:
        fontFamily => ({ chain }) => {
          return chain().setMark(this.name, { fontFamily }).run()
        },
      unsetFontFamily:
        () => ({ chain }) => {
          return chain().unsetMark(this.name).run()
        },
    }
  },
})
