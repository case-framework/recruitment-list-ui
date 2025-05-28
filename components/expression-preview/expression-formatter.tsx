import type React from "react"
import { Expression, ExpressionArg } from 'survey-engine/data_types'

interface ExpressionFormatterProps {
  expression: Expression
  depth?: number
  lineNumber?: { current: number }
  isLastItem?: boolean
}

interface LineWithNumberProps {
  lineNumber: { current: number }
  children: React.ReactNode
  depth?: number
}

function LineWithNumber({ lineNumber, children, depth = 0 }: LineWithNumberProps) {
  const currentLine = lineNumber.current + 0.5
  lineNumber.current = currentLine
  const tabs = '  '.repeat(depth) // Use tab characters for indentation

  return (
    <div className="flex items-start">
      <span className="text-gray-400 text-xs font-mono w-8 text-right mr-3 mt-0.5 select-none shrink-0">{currentLine}</span>
      <pre className="flex-1 font-mono" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
        {tabs}{children}
      </pre>
    </div>
  )
}

export function ExpressionFormatter({
  expression,
  depth = 0,
  lineNumber,
  isLastItem = true,
}: ExpressionFormatterProps) {
  // If no lineNumber is provided, create a local one (for standalone use)
  const localLineNumber = lineNumber || { current: 0 }

  const formatArgument = (arg: ExpressionArg, index: number, totalArgs: number) => {
    const isLast = index === totalArgs - 1

    if (arg === null) {
      return (
        <LineWithNumber key={index} lineNumber={localLineNumber} depth={depth + 1}>
          <span className="text-red-600">null</span>
          {!isLast && <span>,</span>}
        </LineWithNumber>
      )
    }
    if (arg.dtype === "str") {
      return (
        <LineWithNumber key={index} lineNumber={localLineNumber} depth={depth + 1}>
          <span className="text-green-600">&quot;{arg.str}&quot;</span>
          {!isLast && <span>,</span>}
        </LineWithNumber>
      )
    }
    if (arg.dtype === "num") {
      return (
        <LineWithNumber key={index} lineNumber={localLineNumber} depth={depth + 1}>
          <span className="text-blue-600">{arg.num}</span>
          {!isLast && <span>,</span>}
        </LineWithNumber>
      )
    }
    if (arg.dtype === "exp" && arg.exp) {
      return (
        <div key={index}>
          <ExpressionFormatter
            expression={arg.exp}
            depth={depth + 1}
            lineNumber={localLineNumber}
            isLastItem={isLast} // Nested expressions don't need trailing commas
          />
        </div>
      )
    }
    return null
  }

  const args = expression.data || []

  return (
    <div className="text-sm w-fit">
      <LineWithNumber lineNumber={localLineNumber} depth={depth}>
        <span className="text-purple-600">{expression.name}</span>
        <span>(</span>
        {args.length === 0 && (
          <>
            <span>)</span>
            {!isLastItem && <span>,</span>}
          </>
        )}
      </LineWithNumber>

      {args.length > 0 && (
        <>
          <div>{args.map((arg, index) => formatArgument(arg, index, args.length))}</div>
          <LineWithNumber lineNumber={localLineNumber} depth={depth}>
            <span>)</span>
            {!isLastItem && <span>,</span>}
          </LineWithNumber>
        </>
      )}
    </div>
  )
}
