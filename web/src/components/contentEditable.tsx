import { useRef, useState, useEffect } from "react"

type contentEditableProps = {
    defaultValue?: string
    onChange?: (v: string) => unknown
    className?: string
}
export function ContentEditable({
    defaultValue,
    onChange,
    className,
}: contentEditableProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [value, setValue] = useState(defaultValue ?? "")

    useEffect(() => {
        ref.current!.textContent = defaultValue ?? ""
    }, [defaultValue])

    useEffect(() => {
        onChange?.(value)
    }, [value])

    const onInput = () => {
        setValue(ref.current!.textContent as string)
    }

    return (
        <div
            contentEditable
            className={className}
            ref={ref}
            onKeyUp={onInput}
        ></div>
    )
}
