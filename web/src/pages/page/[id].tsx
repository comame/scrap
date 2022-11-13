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
                    text-3xl py-8 px-16 border-b-2 w-full
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
        <div className="overflow-y-auto">
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
    }
    useEffect(() => {
        if (isEditing) {
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
            cursorPositon += currentTags[i].length
            ref.current?.setSelectionRange(cursorPositon, cursorPositon)
        }
    }, [ref.current, isEditing])

    const [inputValue, setInputValue] = useState("")
    const onInput = (v: string) => {
        setInputValue(v)
        const tags = v
            .split(/\s+/)
            .map((v) => v.trim())
            .filter((v) => v !== "")
        const candidates =
            v[v.length - 1] === " "
                ? getCandidates("")
                : getCandidates(tags[tags.length - 1])
        console.log(candidates)
    }
    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        switch (e.key) {
            case "Enter": {
                endInput()
                break
            }
        }
    }
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
                        <div className="inline-block bg-tag text-transparent rounded-8 px-8 focus-within:outline-2 focus-within:outline -outline-offset-2 outline-text2">
                            {inputValue}
                        </div>
                        <input
                            value={inputValue}
                            onInput={(e) => onInput(e.currentTarget.value)}
                            onKeyDown={onKeyDown}
                            onBlur={endInput}
                            ref={ref}
                            className="absolute top-0 left-0 bg-transparent px-8 outline-none inline-block w-full h-full"
                        />
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
            </ul>
        </span>
    )
}
