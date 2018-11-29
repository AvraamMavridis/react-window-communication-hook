const { useState, useEffect, useRef } = require('react');

const initialState = {
  lastMessage: undefined,
  messages: []
};

const supportsBroadcastAPI = (() => window && window.BroadcastChannel)();

function useBrowserContextCommunication(channelName) {
  if (channelName === undefined) {
    throw Error('You need to pass a channel name e.g. useBrowserContextCommunication("GreatChannel")');
  }


  const [ state, setMessages ] = useState(initialState);
  let channel;

  if (supportsBroadcastAPI) {
    channel = useRef(new BroadcastChannel(channelName));
  }

  function postMessage(message) {
    if (message) {
      const msg = JSON.stringify({
        message,
        time: Date.now()
      });

      if (supportsBroadcastAPI && channel) {
        channel.current.postMessage(msg);
      } else {
        window.localStorage.setItem(channelName, msg);
      }
    }
  }

  function updateState(data) {
    setMessages(prevState => {
      return {
        lastMessage: data.message,
        messages: prevState.messages.concat(data.message)
      };
    });
  }

  function updateFromLocalStorage(e) {
    const data = JSON.parse(e.newValue);
    updateState(data);
  }

  useEffect(
    () => {
      if (supportsBroadcastAPI) {
        if (channel && channel.current) {
          channel.current.onmessage = e => updateState(JSON.parse(e.data));
        }
      } else {
        window.addEventListener('storage', updateFromLocalStorage);
      }

      return function cleanup() {
        if (channel.current) {
          channel.current.close();
          channel.current = null;
        } else {
          window.localStorage.removeItem(channelName);
          window.removeEventListener('storage', updateFromLocalStorage);
        }
      };
    },
    [ channelName ]
  );

  return [ state, postMessage ];
}

module.exports = useBrowserContextCommunication;
