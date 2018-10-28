const { useState, useEffect, useRef } = require("react");

const initialState = {
  lastMessage: undefined,
  messages: []
};

const supportsBroadcastAPI = (() => window && window.BroadcastChannel)();

function useTabCommunication(channel_name) {
  const [state, setMessages] = useState(initialState);
  let channel;

  if (supportsBroadcastAPI) {
    channel = useRef(new BroadcastChannel(channel_name));
  }

  const postMessage = function(message) {
    if (message) {
      const msg = JSON.stringify({
        message,
        time: Date.now()
      });

      if (supportsBroadcastAPI && channel) {
        channel.current.postMessage(msg);
      } else {
        window.localStorage.setItem(channel_name, msg);
      }
    }
  };

  const updateState = function(data) {
    setMessages(state => {
      return {
        lastMessage: data.message,
        messages: state.messages.concat(data.message)
      };
    });
  };

  const updateFromLocalStorage = function(e) {
    const data = JSON.parse(e.newValue);
    updateState(data);
  };

  useEffect(
    () => {
      if (supportsBroadcastAPI) {
        if (channel && channel.current) {
          channel.current.onmessage = e => updateState(JSON.parse(e.data));
        }
      } else {
        window.addEventListener("storage", updateFromLocalStorage);
      }

      return function cleanup() {
        if (channel.current) {
          channel.close();
        } else {
          window.localStorage.removeItem(channel_name);
          window.removeEventListener("storage", updateFromLocalStorage)
        }
      };
    },
    [channel_name]
  );

  return [state, postMessage];
}

module.exports = useTabCommunication;
