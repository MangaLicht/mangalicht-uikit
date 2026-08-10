import { createContext } from 'react'

export interface DropDownContextValue {
  /** Закрывает всю цепочку меню — от текущего уровня до самого корня */
  closeMenu: () => void
  /** Закрывать ли меню после клика по листовому DropDownItem */
  closeOnItemClick: boolean
  /**
   * Открыт ли DropDown-родитель ИМЕННО этого уровня (не обязательно
   * корень!). Как только станет false — этот уровень обязан немедленно
   * закрыть сам себя, а его собственные дети получат уже ЕГО open (false)
   * как свой parentOpen — так закрытие каскадно доходит до самой глубокой
   * вложенности, а не только при закрытии корня целиком.
   */
  parentOpen: boolean
  registerPanel: (node: HTMLElement) => void
  unregisterPanel: (node: HTMLElement) => void
}

export const DropDownContext = createContext<DropDownContextValue | null>(null)