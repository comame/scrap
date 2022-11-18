import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { note, noteMetadata } from "../../api/types"
import { useSuspendApi, _useSuspendApi } from "../../api/useApi"
import { ContentEditable } from "../../components/contentEditable"

export default function Page() {
    const router = useRouter()
    const id = router.query["id"] as string

    const noteResponse = _useSuspendApi("/notes.get", {
        id,
    })

    return (
        <div className="bg-surface4 h-screen w-full flex justify-center items-center">
            {"data" in noteResponse && <Note note={noteResponse.data.value} />}
        </div>
    )
}

type noteProps = {
    note: note
}
function Note({ note }: noteProps) {
    return (
        <div
            className={`
                bg-background1
                p-40 pr-24
                rounded-16
                w-10/12 h-5/6 max-w-screen-screen4
                mobile:p-24 mobile:pr-0
                mobile:rounded-none
                mobile:w-full mobile:h-full mobile:max-w-[unset]
            `}
        >
            <div className="overflow-auto h-full pr-16 mobile:pr-24">
                <Title
                    title={note.title}
                    onChange={(v) => {
                        console.log(v)
                    }}
                />
                <div className="mt-40">
                    <Metadata
                        noteMetadata={note}
                        onChange={(v) => {
                            console.log(v)
                        }}
                    />
                </div>
                <div className="mt-40 whitespace-pre-line">{note.content}</div>
            </div>
        </div>
    )
}

type titleProps = {
    title: string
    onChange: (v: string) => unknown
}
function Title({ title, onChange }: titleProps) {
    const [currentTitle, setCurrentTitle] = useState(title)
    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(currentTitle)
        }, 1000)
        return () => {
            clearTimeout(timeout)
        }
    }, [currentTitle])

    return (
        <div>
            <input
                value={currentTitle}
                onInput={(e) => setCurrentTitle(e.currentTarget.value)}
                placeholder="タイトルを入力"
                className={`
                    text-text2 hover:text-text2-focus focus:text-text1
                    typography-32 h-[56px] py-8 px-16 border-b-2 w-full
                    outline-none border-default focus:border-[#858585] hover:border-default-hover
                    placeholder:text-surface4 placeholder:hover:text-surface4-press placeholder:focus:text-surface4-press
                    transition-all placeholder:transition-all
                `}
            ></input>
        </div>
    )
}

type metadataProps = {
    noteMetadata: noteMetadata
    onChange: (noteMetadata: noteMetadata) => unknown
}
function Metadata({ noteMetadata, onChange }: metadataProps) {
    const [currentMetadata, setCurrentMetadata] = useState(noteMetadata)
    return (
        <div className="">
            <table className="w-col-span-4 mx-auto">
                <tbody>
                    <tr>
                        <td className="w-[8rem]">作成者</td>
                        <td>{currentMetadata.creator}</td>
                    </tr>
                    <tr>
                        <td className="w-[8rem]">閲覧可能</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td className="w-[8rem]">編集可能</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td className="w-[8rem]">作成日</td>
                        <td>{currentMetadata.create_date}</td>
                    </tr>
                    <tr>
                        <td className="w-[8rem]">更新日</td>
                        <td>{currentMetadata.update_date}</td>
                    </tr>
                    <tr>
                        <td className="w-[8rem]">タグ</td>
                        <td>
                            <TagList
                                tags={currentMetadata.tags}
                                onChange={() => {}}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

type tagListProps = {
    tags: string[]
    onChange: (v: string[]) => unknown
}
function TagList({ tags, onChange }: tagListProps) {
    const [currentTags, setCurrentTags] = useState(tags)
    const [isEditing, setIsEditing] = useState(false)
    const [candidates, setCandidates] = useState<string[]>([])
    const [candidateIndex, setCandidateIndex] = useState(0)

    const tagAllResponse = _useSuspendApi("/tags.all", {})
    const tagCandidates =
        "data" in tagAllResponse ? tagAllResponse.data.value : []
    const getCandidates = (text: string) => {
        const candidates = [...tagCandidates]
        candidates.sort()
        if (text.trim().length === 0) {
            return candidates
        }
        return candidates.filter((v) =>
            v.toLocaleLowerCase().startsWith(text.trim().toLowerCase())
        )
    }

    const ref = useRef<HTMLInputElement>(null)

    const [selectTagIndex, setSelectTagIndex] = useState(-1)
    const onStartEdit = (tagIndex: number) => {
        setIsEditing(true)
        setInputValue(currentTags.join(" "))
        setSelectTagIndex(tagIndex)
        setCandidateIndex(0)
        setCandidates(getCandidates(""))
    }
    useEffect(() => {
        if (isEditing) {
            if (document.activeElement === ref.current) {
                return
            }
            ref.current?.focus()
            let cursorPositon = 0
            let i = 0
            while (i < selectTagIndex) {
                cursorPositon += currentTags[i].length
                if (i > 0) {
                    cursorPositon += 1
                }
                i += 1
            }
            if (i > 0) {
                cursorPositon += 1
            }
            cursorPositon += currentTags[i]?.length ?? 0
            ref.current?.setSelectionRange(cursorPositon, cursorPositon)
        }
    }, [ref.current, isEditing])

    /** replace は入力中の文字よりも長い */
    const replaceWithCandidate = (
        value: string,
        cursorPosition: number,
        replace: string
    ): [newValue: string, cursorPosition: number] => {
        console.log({ value, cursorPosition, replace })

        const chars: string[] = []
        let i = cursorPosition - 1
        while (i >= 0) {
            if (value[i] === " ") {
                i += 1
                break
            }
            chars.push(value[i])
            i -= 1
        }
        const tag = chars.reverse().join("")

        if (replace.length < tag.length) {
            throw 1
        }

        const newValue =
            value.slice(0, i) + replace + value.slice(cursorPosition)
        const newCursorPosition = cursorPosition + (replace.length - tag.length)

        return [newValue, newCursorPosition]
    }

    const [inputValue, setInputValue] = useState("")
    const onInput = (v: string) => {
        setCandidateIndex(0)
        setInputValue(v)

        const cursorPosition = ref.current?.selectionStart
        if (cursorPosition === undefined) {
            return
        }
        const chars: string[] = []

        let i = (cursorPosition ?? 0) - 1
        while (i >= 0) {
            if (v[i] === " ") {
                break
            }
            chars.push(v[i])
            i -= 1
        }
        const tag = chars.reverse().join("")
        const candidates = getCandidates(tag)
        setCandidates(candidates)
    }
    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        switch (e.key) {
            case "Enter": {
                const selectedCandidate = candidates[candidateIndex]
                if (selectedCandidate) {
                    const cursorPosition = ref.current?.selectionStart
                    if (cursorPosition === undefined) {
                        break
                    }
                    const [v, newCursorPosition] = replaceWithCandidate(
                        inputValue,
                        cursorPosition ?? 0,
                        selectedCandidate
                    )
                    setInputValue(v)
                    ref.current?.setSelectionRange(
                        newCursorPosition,
                        newCursorPosition
                    )
                } else {
                    endInput()
                }
                break
            }
            case "ArrowUp": {
                e.preventDefault()
                setCandidateIndex((i) => Math.max(0, i - 1))
                break
            }
            case "ArrowDown": {
                e.preventDefault()
                setCandidateIndex((i) => Math.min(candidates.length - 1, i + 1))
                break
            }
        }
    }
    useEffect(() => {
        console.log(candidateIndex)
    }, [candidateIndex])
    const endInput = () => {
        setIsEditing(false)
        const tags = inputValue
            .split(/\s+/)
            .map((v) => v.trim())
            .filter((v) => v !== "")
        const uniqueTags = Array.from(new Set(tags))
        setCurrentTags(uniqueTags)
    }

    return (
        <span>
            <ul className="inline">
                {isEditing ? (
                    <div className="relative">
                        <div className="inline-block bg-tag text-transparent rounded-8 px-8 focus-within:outline-2 focus-within:outline -outline-offset-2 outline-text2 whitespace-nowrap">
                            {inputValue ? inputValue : "&nbsp;"}
                        </div>
                        <input
                            value={inputValue}
                            onInput={(e) => onInput(e.currentTarget.value)}
                            onKeyDown={onKeyDown}
                            onBlur={endInput}
                            ref={ref}
                            className="absolute top-0 left-0 bg-transparent px-8 outline-none inline-block w-full h-full whitespace-nowrap"
                        />
                        <ul className="absolute top-24 left-0 w-full z-10 bg-background2 max-w-min">
                            {candidates.map((candidate, i) =>
                                i === candidateIndex ? (
                                    <div
                                        className="bg-background2-press w-full"
                                        key={candidate}
                                    >
                                        <li className="max-w-min px-8">
                                            {candidate}
                                        </li>
                                    </div>
                                ) : (
                                    <li
                                        className="max-w-min px-8"
                                        key={candidate}
                                    >
                                        {candidate}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                ) : (
                    currentTags.map((tag, i) => (
                        <li
                            onClick={() => onStartEdit(i)}
                            onKeyDown={() => onStartEdit(i)}
                            key={tag}
                            tabIndex={0}
                            className="inline-block mr-8 px-8 rounded-4 bg-tag hover:bg-tag-hover focus-within:outline-2 focus-within:outline -outline-offset-2 outline-text2"
                        >
                            <span>{tag}</span>
                        </li>
                    ))
                )}
                {!isEditing && currentTags.length === 0 && (
                    <div
                        onClick={() => onStartEdit(-1)}
                        onKeyDown={() => onStartEdit(-1)}
                        tabIndex={0}
                        className="inline-block text-text2 mr-8 px-8 rounded-4 bg-tag hover:bg-tag-hover focus-within:outline-2 focus-within:outline -outline-offset-2 outline-text2"
                    >
                        タグを入力
                    </div>
                )}
            </ul>
        </span>
    )
}
