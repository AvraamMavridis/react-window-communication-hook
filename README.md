# react-window-communication-hook

React hook to communicate among browsers contexts (windows, tabs, iframes).

Example use case: When the user presses logout in one tab, logout from every other tab


## How to use it

Import

```
import useBrowserContextCommunication from 'react-window-communication-hook';
```

pass a channel name

```
const [communicationState, postMessage] = useBrowserContextCommunication("myGreatChannel");
```

`communicationState` contains `lastMessage` and `messages` which is an array of the messages that where send from other tabs/windows to the current one.

Use `postMessage` to send messages to the other browser contextes (windows, tabs, iframes)


# Example

```js
import useBrowserContextCommunication from 'react-window-communication-hook';


function App() {
  // state ({lastMessage,messages}) that comes from other browser context
  const [communicationState, postMessage] = useBrowserContextCommunication("channel");
  // Tabs, Windows etc are not listening to there own messages so
  // we need an extra local state
  const [status, setStatus] = useState("login");

  function logout() {
    setStatus("logout");
    postMessage("logout");
  }

  const shouldLogout = [communicationState.lastMessage, status].includes('logout');

  return (
    <div className="App" >
      <h1>{shouldLogout ? 'Logged Out' : 'Logged In' }</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

<img src="https://github.com/AvraamMavridis/react-window-communication-hook/blob/master/demo_gif.gif" />


# License

MIT
