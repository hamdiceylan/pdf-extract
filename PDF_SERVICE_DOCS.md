# PDF Service

A simple service that extracts data from a given PDF file (the main code/logic has been mocked out for this task).

The code is available in `src/pdf-service.ts`.

Access the service via the `PdfService` class.

The class must be initialised with a key before use. Use the string `"TEST_KEY"` as the key for this task.

You can then call the `extract()` method with a file path of a PDF to get data from it (path for each PDF is given in the 'Files' tab).

Example usage:

```typescript
import { PdfService } from './src/pdf-service'

async function main() {
  const pdfService = new PdfService("TEST_KEY")
  
  const data = await pdfService.extract("assets/retailco.pdf")
  
  console.dir(data, { depth: 5 })
}

main()
```

If an incorrect file path is passed to the service, an exception will be raised.
