"use client"

import { ExpressionFormatter } from "./expression-formatter"
import { Expression } from "survey-engine/data_types"


interface ExpressionPreviewProps {
  expressions: Expression[]
}

export default function ExpressionPreview({ expressions }: ExpressionPreviewProps) {

  // Global line number counter for the entire preview
  const globalLineNumber = { current: 0 }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg overflow-x-auto">

      {expressions.map((expression, index) => (

        <div key={index} className="ml-0 w-fit overflow-hidden">
          <ExpressionFormatter
            expression={expression}
            lineNumber={globalLineNumber}
            isLastItem={true} // Each top-level expression is treated as complete
          />
        </div>

      ))}

    </div>
  )
}
