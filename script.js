let callObject = null;

function joinRoom(conversationId) {
  if (callObject) {
    callObject.leave();
  }

  // Create the call object
  callObject = DailyIframe.createCallObject();

  // Join the room
  callObject.join({ 
    url: `https://tavus.daily.co/${conversationId}`,
    userName: "Local" // Specify the name of the joining participant
  })
  .then(() => {
    console.log(`Successfully joined room: ${conversationId}`);
    // Add a delay before checking for participants
    setTimeout(() => {
      checkForExistingParticipant();
    }, 1500); // Wait for 1.5 seconds before checking
  })
  .catch((err) => {
    console.error('Error joining the room:', err);
    alert('Failed to join the call. Please check the conversation ID.');
  });

  callObject.on('app-message', (message) => {
    console.log('Received app-message:', message);
    appendToLog(message.data);
  });
}

function checkForExistingParticipant() {
  const participants = callObject.participants();
  console.log('Participants:', participants);

  const existingParticipant = Object.values(participants).find(
    (participant) => participant.local === false
  );

  if (existingParticipant) {
    console.log(`Existing participant found: ${existingParticipant.user_id}`);

    // Subscribe to the participant's video and audio tracks
    if (existingParticipant.tracks.video.state === 'playable') {
      const videoElement = document.getElementById('participant-video');
      videoElement.srcObject = new MediaStream([existingParticipant.tracks.video.persistentTrack]);
    } else {
      console.log('No playable video track for existing participant.');
    }

    if (existingParticipant.tracks.audio.state === 'playable') {
      const audioStream = new MediaStream([existingParticipant.tracks.audio.persistentTrack]);
      const audio = new Audio();
      audio.srcObject = audioStream;
      audio.autoplay = true;
    } else {
      console.log('No playable audio track for existing participant.');
    }
  } else {
    console.log('No existing participant found.');
  }
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
    if (!callObject) {
      console.error("callObject is not initialized. Please join a room first.");
      alert("Please join a room before sending messages.");
      return;
    }

    const code = document.getElementById(textAreaId).value;
    const match = code.match(/sendAppMessage\(\s*({[\s\S]*})\s*\);/);

    if (match && match[1]) {
      const messageData = eval(`(${match[1]})`);
      callObject.sendAppMessage(messageData);
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
  // Only log conversation.utterance events
  if (data.event_type !== 'conversation.utterance') {
    return;
  }

  const timestamp = new Date();
  const formattedTimestamp = `${timestamp.toLocaleTimeString('en-US', { hour12: true })}.${String(timestamp.getMilliseconds()).padStart(3, '0')}`;
  const logEntryContent = `[${formattedTimestamp}] Role: ${data.properties?.role || 'N/A'}, Speech: ${data.properties?.speech || 'N/A'}`;
  
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
