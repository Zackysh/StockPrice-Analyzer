import { ComponentProps, FC } from "react"

interface Props extends React.HTMLAttributes<Element> {}

const Buttonx: FC<Props> = ({ children }) => {
  return (
    <>
    <br></br>
    <button>{children}</button>
    </>
    
  )
}
export default Buttonx
