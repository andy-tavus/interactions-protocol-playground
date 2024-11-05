let callFrame;

function joinRoom(conversationId) {
  if (callFrame) {
    callFrame.leave();
  }

  callFrame = window.DailyIframe.createFrame({
    showLeaveButton: true,
    iframeStyle: {
      position: 'fixed',
      width: '65%',
      height: '44%',
      top: '48%',
      left: '50%',
      border: '2px solid',
      zIndex: 1,
      transform: 'translate(-50%, -50%)'
    }
  });

  callFrame.join({ url: `https://tavus.daily.co/${conversationId}` })
    .then(() => console.log(`Successfully joined room: ${conversationId}`))
    .catch((err) => console.error('Error joining the room:', err));

  callFrame.on('app-message', (message) => {
    console.log('Received app-message:', message);
    appendToLog(message.data);
  });
}

function joinNewRoom() {
  const conversationId = document.getElementById('conversation-id').value;

  if (conversationId.trim() === "") {
    alert("Please enter a valid conversation ID.");
    return;
  }

  joinRoom(conversationId);
  updateTextAreas();
}

function updateTextAreas() {
  const conversation_id = document.getElementById('conversation-id').value || "c123456";

  document.getElementById('echo-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.echo",
    "conversation_id": "${conversation_id}",
    "properties": {
      "text": "This is the text the replica will speak."
    }
  });`;

  document.getElementById('respond-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.respond",
    "conversation_id": "${conversation_id}",
    "properties": {
      "text": "This is text the replica will respond to, as if the user in the meeting spoke it."
    }
  });`;

  document.getElementById('interrupt-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.interrupt",
    "conversation_id": "${conversation_id}"
  });`;

  document.getElementById('overwrite-context-box').value = `sendAppMessage({
    "message_type": "conversation",
    "event_type": "conversation.overwrite_llm_context",
    "conversation_id": "${conversation_id}",
    "properties": {
      "text": "This text is the context that will be used to overwrite the existing conversational context."
    }
  });`;
}

function executeCode(textAreaId) {
  try {
    if (!callFrame) {
      console.error("callFrame is not initialized. Please join a room first.");
      alert("Please join a room before sending messages.");
      return;
    }

    const code = document.getElementById(textAreaId).value;
    const match = code.match(/sendAppMessage\(\s*({[\s\S]*})\s*\);/);

    if (match && match[1]) {
      const messageData = eval(`(${match[1]})`);
      callFrame.sendAppMessage(messageData);
      console.log("Message sent:", messageData);
    } else {
      console.error("Invalid sendAppMessage format.");
    }
  } catch (err) {
    console.error('Error executing the code:', err);
  }
}

let logEntries = [];

function appendToLog(data) {
  const timestamp = new Date();
  const formattedTimestamp = `${timestamp.toLocaleTimeString('en-US', { hour12: true })}.${String(timestamp.getMilliseconds()).padStart(3, '0')}`;
  const logEntryContent = `[${formattedTimestamp}] Role: ${data.properties?.role || 'N/A'}, Speech: ${data.properties?.speech || 'N/A'}, Visual Context: ${data.properties?.visual_context || 'N/A'}`;
  
  logEntries.push({ timestamp, content: logEntryContent });
  logEntries.sort((a, b) => a.timestamp - b.timestamp);

  const logContent = document.getElementById('log-content');
  logContent.innerHTML = "";
  logEntries.forEach(entry => {
    const logEntry = document.createElement('div');
    logEntry.textContent = entry.content;
    logContent.appendChild(logEntry);
  });

  logContent.scrollTop = logContent.scrollHeight;
}
