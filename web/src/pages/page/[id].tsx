import { useRouter } from "next/router"
import { useEffect, useRef } from "react"

export default function Page() {
    const router = useRouter()
    const id = router.query["id"] as string

    const element = useRef<HTMLDivElement>(null)

    useEffect(() => {
        element.current!.textContent = `HELLO ${id}`
    }, [id])

    const onKeyDown = () => {
        console.log("type!")
    }

    return <div contentEditable ref={element} onKeyDown={onKeyDown}></div>
}
