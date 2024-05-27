export default function CreatePanel() {
  return (
    <div>
      <h1>Manage Channel</h1>
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
  );
}
