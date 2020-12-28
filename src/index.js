const { useState, useEffect, useRef } = require('react');

const initialState = {
  lastMessage: undefined,
  messages: [],
};

const supportsBroadcastAPI = typeof window !== 'undefined' && 'BroadcastChannel' in window;

function useBrowserContextCommunication(channelName) {
  if (channelName === undefined) {
    throw Error('You need to pass a channel name e.g. useBrowserContextCommunication("GreatChannel")');
  }

  const [ state, setMessages ] = useState(initialState);
  const channel = useRef();

  if (supportsBroadcastAPI) {
    channel.current = new BroadcastChannel(channelName);
  }

  function postMessage(message) {
    if (message) {
      const msg = JSON.stringify({
        message,
        time: Date.now(),
      });

      if (supportsBroadcastAPI && channel && channel.current) {
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
        messages: prevState.messages.concat(data.message),
      };
    });
  }

  function updateFromLocalStorage(e) {
    try {
      const data = JSON.parse(e.newValue);
      if (data !== null && data !== undefined) {
        updateState(data);
      }
    } catch (error) {
      console.info('React Window Communication: Failed to parse json from localstorage');
    }
  }

  useEffect(() => {
    if (supportsBroadcastAPI && channel && channel.current) {
      if (channel && channel.current) {
        channel.current.onmessage = e => updateState(JSON.parse(e.data));
      }
    } else {
      window.addEventListener('storage', updateFromLocalStorage);
    }

    return function cleanup() {
      if (channel && channel.current) {
        channel.current.close();
        channel.current = null;
      } else {
        window.localStorage.removeItem(channelName);
        window.removeEventListener('storage', updateFromLocalStorage);
      }
    };
  }, [ channelName ]);

  return [ state, postMessage ];
}

module.exports = useBrowserContextCommunication;
