# Interactions Protocol Playground
### Powered by [Tavus](https://tavus.io)

The **Interactions Protocol Playground** web app allows users to interact with a Daily video room integrated with Tavus's backend for testing replica interactions. Specifically, it utilizes Tavus's [Interactions Protocol](https://docs.tavus.io/sections/conversational-video-interface/live-interactions). Here’s a breakdown of its components and interactions:

## 1. Room Join & ID Management
   - **Conversation ID Input**: Users enter a Tavus `conversation_id` in the input box and press the "Join" button to initiate a session with that specific ID. 
   - **Dynamic Updates**: When a new conversation ID is entered, it updates all interaction text areas with the current ID.

## 2. Interaction Buttons and Event Types
   - Each interaction button is associated with a specific `event_type`:
     - **Echo**: Triggers the `conversation.echo` event, where the replica speaks a predefined message. This is set in the `echo-box` text area.
     - **Respond**: Simulates a user’s spoken input, sending a message under the `conversation.respond` event as if the user had spoken in the room.
     - **Interrupt**: Initiates an `conversation.interrupt` event, signaling an interruption in the ongoing interaction.
     - **Overwrite Context**: This action updates the conversational context with new information, using the `conversation.overwrite_llm_context` event. This is useful for changing the replica’s understanding of the conversation.

   - **Message Execution**: Each button has an `executeCode` function, parsing and validating the JSON in the respective text area. The `callFrame.sendAppMessage()` method then sends this data.

## 3. Event Listening and Utterance Log
   - **App Message Listener**: Upon joining a room, the `callFrame` listens for `app-message` events. These include all interactions and updates from Tavus or Daily, relayed in real-time.
   - **Log Handling**: Each received message is parsed and appended to a log with a timestamp in `[HH:MM:SS.MS AM/PM]` format. Each entry includes:
     - **Role**: Indicates the role of the speaker (e.g., user, replica).
     - **Speech**: Content of the spoken text.
     - **Visual Context**: Any associated visual context data.
   - **Chronological Order**: Log entries are ordered chronologically, refreshing to display the latest messages at the bottom.

This setup allows users to test various conversational interactions in a controlled environment, viewing real-time responses from the replica as well as logs of each exchange.
