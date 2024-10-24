<script setup>
// Page Meta
definePageMeta({
  title: "User Guide",
  description: "User Guide",
  layout: "ai",
  middleware: ["auth"],
  requiresAuth: true,
});
</script>

<template>
  <div class="flex flex-col h-[88dvh] md:h-[94dvh] max-w-7xl mx-auto">
    <LayoutsBreadcrumbV2 />

    <NuxtScrollbar style="max-height: 80dvh" class="pr-5">
      <div class="space-y-12">
        <!-- Getting Started Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Getting Started</h2>
          <p class="mb-4">
            Welcome to our AI Assistant platform! This powerful tool allows you
            to interact with various specialized AI assistants to help you with
            different tasks and queries. Before you start chatting, you'll need
            to choose an assistant that best fits your needs.
          </p>

          <div
            class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4"
          >
            <p class="font-bold">Quick Start:</p>
            <ol class="list-decimal list-inside ml-4">
              <li>Select or create a project from the sidebar</li>
              <li>Choose an available assistant from the list</li>
              <li>Start a new chat or continue an existing one</li>
              <li>Type your question or request in the chat input</li>
              <li>Press Enter or click the send button</li>
            </ol>
          </div>

          <!-- Placeholder for a screenshot or GIF -->
          <div class="bg-gray-200 p-4 text-center mb-4">
            [INSERT SCREENSHOT/GIF OF ASSISTANT SELECTION AND MAIN CHAT
            INTERFACE]
          </div>
        </section>

        <!-- Choosing an Assistant Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Choosing an Assistant</h2>
          <p class="mb-4">
            Our platform offers various AI assistants, each specialized in
            different areas. Choosing the right assistant is crucial for getting
            the most relevant and helpful responses.
          </p>

          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-medium mb-2">Available Assistants</h3>
              <p>
                You can choose from several assistants, each with unique
                capabilities. Some examples include:
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>Analyst Pro</li>
                <li>User Manual Pro</li>
                <li>Document Navigator</li>
                <li>Prototype Generator</li>
                <li>Code Generator</li>
              </ul>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">
                How to Select an Assistant
              </h3>
              <ol class="list-decimal list-inside ml-4">
                <li>
                  Navigate to the "Explore" or "New Chat" section in the sidebar
                </li>
                <li>Browse through the list of available assistants</li>
                <li>
                  Click on an assistant to view its details and capabilities
                </li>
                <li>
                  Select "Start Chat" or "Use This Assistant" to begin your
                  conversation
                </li>
              </ol>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">Assistant Details</h3>
              <p>Each assistant has the following information:</p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li><strong>Name:</strong> The assistant's identifier</li>
                <li>
                  <strong>Description:</strong> A brief overview of the
                  assistant's capabilities
                </li>
                <li>
                  <strong>Type:</strong> The category or specialization of the
                  assistant
                </li>
                <li>
                  <strong>Status:</strong> Whether the assistant is currently
                  available or not
                </li>
              </ul>
            </div>

            <!-- Placeholder for a screenshot -->
            <div class="bg-gray-200 p-4 text-center mb-4">
              [INSERT SCREENSHOT OF ASSISTANT SELECTION INTERFACE]
            </div>
          </div>
        </section>

        <!-- Main Features Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Main Features</h2>

          <div class="space-y-8">
            <div>
              <h3 class="text-xl font-medium mb-2">1. Chat Interface</h3>
              <p class="mb-2">
                Once you've selected an assistant, you can start chatting. The
                interface allows you to interact with the AI seamlessly.
              </p>
              <p class="mb-2">
                <strong>Example:</strong> If you've chosen the Technical Support
                Assistant, you might ask, "How do I troubleshoot a slow internet
                connection?" The AI will provide step-by-step guidance tailored
                to technical support.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF CHAT INTERFACE WITH EXAMPLE CONVERSATION]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">2. Project Management</h3>
              <p class="mb-2">
                Organize your work efficiently by creating and switching between
                different projects. Each project maintains its own context and
                conversation history.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To create a new project: Click the '+' button next to the
                  project dropdown in the sidebar.
                </li>
                <li>
                  To switch projects: Use the dropdown menu in the sidebar.
                </li>
              </ul>
              <p class="mb-2">
                <strong>Pro Tip:</strong> Create separate projects for different
                clients, research topics, or personal vs. work-related queries
                to keep your conversations organized.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF PROJECT MANAGEMENT INTERFACE]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">3. File Attachments</h3>
              <p class="mb-2">
                Enhance your conversations by uploading and attaching files. Our
                AI can analyze images using OCR and reference documents in its
                responses.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To attach a file: Click the attachment icon (paperclip) in the
                  chat input.
                </li>
                <li>
                  Supported file types: Images (JPG, PNG), Documents (PDF, DOCX)
                </li>
              </ul>
              <p class="mb-2">
                <strong>Example Use Case:</strong> Upload an image of a complex
                diagram and ask the AI to explain it. Or attach a research paper
                and ask for a summary of key findings.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF FILE ATTACHMENT PROCESS]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">4. Saved Prompts</h3>
              <p class="mb-2">
                Save time by storing and reusing frequently used prompts or
                questions.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To use a saved prompt: Click the bookmark icon and select from
                  your list.
                </li>
                <li>
                  To save a new prompt: Use the "Save Prompt" option in the chat
                  menu (three dots next to your message).
                </li>
              </ul>
              <p class="mb-2">
                <strong>Tip:</strong> Save prompts for common tasks like
                "Summarize this text" or "Explain this concept in simple terms"
                for quick access.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF SAVED PROMPTS INTERFACE]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">5. Document References</h3>
              <p class="mb-2">
                Access context-related files that the AI uses to provide more
                accurate and relevant responses.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To view references: Click the document icon to open the
                  sidebar with relevant documents.
                </li>
                <li>
                  You can view and download these documents for your reference.
                </li>
              </ul>
              <p class="mb-2">
                <strong>Use Case:</strong> When discussing a specific topic, the
                AI might reference relevant academic papers or reports. You can
                easily access these documents to verify information or dive
                deeper into the subject.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF DOCUMENT REFERENCES SIDEBAR]
              </div>
            </div>
          </div>
        </section>

        <!-- Advanced Features Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Advanced Features</h2>

          <div class="space-y-8">
            <div>
              <h3 class="text-xl font-medium mb-2">1. Stop Streaming</h3>
              <p class="mb-2">
                Control the AI's response length by stopping it mid-stream if
                needed.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To stop the AI: Click the stop icon (square icon) that appears
                  during AI response generation.
                </li>
              </ul>
              <p class="mb-2">
                <strong>When to use:</strong> If the AI is generating a response
                that's too long or veering off-topic, you can stop it and
                rephrase your question for a more focused answer.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF STOP STREAMING BUTTON IN ACTION]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">2. AI Tools</h3>
              <p class="mb-2">
                Access specialized AI tools for specific tasks to enhance your
                productivity.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To use AI tools: Navigate to the Tools section from the
                  sidebar.
                </li>
              </ul>
              <p class="mb-2">
                <strong>Available Tools:</strong> [LIST SOME SPECIFIC TOOLS,
                e.g., "Text Summarizer, Code Generator, Data Analyzer"]
              </p>
              <p class="mb-2">
                <strong>Example:</strong> Use the Text Summarizer tool to
                quickly condense long articles or reports into key points.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF AI TOOLS INTERFACE]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">3. Repository</h3>
              <p class="mb-2">
                Manage and organize your documents and files for easy access and
                reference.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To access: Click on the Repository option in the sidebar.
                </li>
                <li>
                  Features: Upload, delete, organize, and search through your
                  files.
                </li>
              </ul>
              <p class="mb-2">
                <strong>Pro Tip:</strong> Organize your files into folders based
                on projects or topics for easier navigation and reference during
                conversations.
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF REPOSITORY INTERFACE]
              </div>
            </div>

            <div>
              <h3 class="text-xl font-medium mb-2">
                4. Assistant Management (Admin/Developer Only)
              </h3>
              <p class="mb-2">
                Create and manage AI assistants with different capabilities to
                suit various needs.
              </p>
              <ul class="list-disc list-inside ml-4 mt-2">
                <li>
                  To access: Click on the Assistant Management option in the
                  sidebar (visible only to admins and developers).
                </li>
              </ul>
              <p class="mb-2">
                <strong>Use Case:</strong> Create specialized assistants for
                different departments or tasks, such as a "Technical Support
                Assistant" or a "Creative Writing Assistant".
              </p>
              <!-- Placeholder for a screenshot -->
              <div class="bg-gray-200 p-4 text-center mb-4">
                [INSERT SCREENSHOT OF ASSISTANT MANAGEMENT INTERFACE]
              </div>
            </div>
          </div>
        </section>

        <!-- Tips and Best Practices Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Tips and Best Practices</h2>
          <ul class="list-disc list-inside space-y-2">
            <li>
              <strong>Be Specific:</strong> Use clear and specific language for
              better AI understanding. Instead of "Tell me about cars," try
              "Explain the basic components of an internal combustion engine."
            </li>
            <li>
              <strong>Experiment with Prompts:</strong> Try rephrasing your
              questions to get different perspectives. For example, "What are
              the benefits of exercise?" vs. "How does regular physical activity
              impact mental health?"
            </li>
            <li>
              <strong>Use Context:</strong> Provide relevant background
              information for more accurate responses. For instance, "Given the
              current economic climate of high inflation, what investment
              strategies should I consider?"
            </li>
            <li>
              <strong>Leverage Document References:</strong> When discussing
              specific topics, check the document sidebar to see what sources
              the AI is using and explore them for deeper understanding.
            </li>
            <li>
              <strong>Save Useful Prompts:</strong> If you find yourself
              frequently asking similar questions, save them as prompts for
              quick access in future conversations.
            </li>
            <li>
              <strong>Optimize Image Uploads:</strong> When using OCR for
              images, ensure they are clear and well-lit for the best results.
            </li>
            <li>
              <strong>Organize with Projects:</strong> Create separate projects
              for different topics or workflows to keep your conversations and
              context organized.
            </li>
          </ul>
        </section>

        <!-- Troubleshooting Section -->
        <section>
          <h2 class="text-2xl font-semibold mb-4">Troubleshooting</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium mb-2">Irrelevant AI Responses</h3>
              <p>If the AI's response seems off-topic or irrelevant:</p>
              <ul class="list-disc list-inside ml-4">
                <li>Try rephrasing your question to be more specific.</li>
                <li>Provide more context or background information.</li>
                <li>Check if you're in the correct project for your query.</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2">File Upload Issues</h3>
              <p>If you're having trouble uploading files:</p>
              <ul class="list-disc list-inside ml-4">
                <li>
                  Ensure the file is in a supported format (JPG, PNG, PDF,
                  DOCX).
                </li>
                <li>
                  Check that the file size is within the allowed limit (usually
                  up to 10MB).
                </li>
                <li>Try a different browser or clear your browser cache.</li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-medium mb-2">Unresponsive Chat</h3>
              <p>If the chat becomes unresponsive:</p>
              <ul class="list-disc list-inside ml-4">
                <li>Refresh the page and try again.</li>
                <li>Check your internet connection.</li>
                <li>Clear your browser cache and cookies.</li>
                <li>If the issue persists, try using a different browser.</li>
              </ul>
            </div>
          </div>
          <p class="mt-4">
            For persistent issues or questions not covered here, please contact
            our support team at [INSERT SUPPORT EMAIL/LINK].
          </p>
        </section>

        <!-- Footer -->
        <footer class="mt-8 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            For more detailed information or support, please contact our help
            desk or refer to the comprehensive documentation.
          </p>
          <p class="text-sm text-gray-500 mt-2">Last updated: [INSERT DATE]</p>
        </footer>
      </div>
    </NuxtScrollbar>
  </div>
</template>
