function Styles() {
  return `  /* Modal container */
  .modal {
    // display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 9999; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }
  
  /* Modal content */
  .modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
  }
  
  /* Close button */
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }`;
}

function CreatePanel() {
  return `
    <div id="myModal" class="modal">
      <div class="modal-content">
        <h1>Create Panel</h1>
        <fieldset>
          <legend>Join Channel</legend>
          <section class='name'>
            <input type='text' id='name' placeholder='Enter your name' />
          </section>
          <section class='join_channel'>
            <input type='text' id='channel_name' placeholder='Channel name' />
            <button>Create or Join Channel</button>
          </section>
        </fieldset>
      </div>
    </div>
  `;
}

function generateHTML(stringHtml) {
  const div = document.createElement("div");
  div.innerHTML = stringHtml;
  return div.firstElementChild;
}

function injectCSS() {
  const style = document.createElement("style");
  style.innerHTML = Styles();
  document.head.appendChild(style);
}

globalThis = {
  CreatePanel,
  generateHTML,
  injectCSS,
  ...globalThis,
};
