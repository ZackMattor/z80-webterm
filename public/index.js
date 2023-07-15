async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

$(() => {
  let socket;

  async function sendLine(line) {
    for (var i = 0; i < line.length; i++) {
      socket.send(line[i]);
      await sleep(1)
    }

    socket.send("\n\r")
    await sleep(1)
  }

  async function updateConnectingClients() {
    let resp = await axios.get('/api/clients')

    $('#status .client-count').html(`Clients: ${resp.data.client_count}`)
  }

  function connect() {
    let clientsInterval;
    socket = new WebSocket(`wss://${location.host}`);
    const $status = $('#status');
    const $status_content = $('#status .status-content');

    socket.onerror = async () => { }

    socket.onclose = () => {
      $status.removeClass();
      $status.addClass('disconnected');
      $status_content.html('Disconnected..');

      console.log('closed')

      term.dispose()

      clearInterval(clientsInterval)
      setTimeout(connect, 5000)
    }

    socket.onopen = () => {
      updateConnectingClients()
      clientsInterval = setInterval(updateConnectingClients, 5000);

      $status.removeClass();
      $status.addClass('connected');
      $status_content.html('Connected!');
    }

    const attachAddon = new AttachAddon.AttachAddon(socket);
    const term = new Terminal();

    term.loadAddon(attachAddon);
    term.open(document.getElementById('terminal'));
  }

  connect();

  $('#submit_text').click(async () => {
    const lines = $('#bulk_text').val().split(/\r?\n/)

    for(const line of lines) {
      await sendLine(line)
    }

    $('#content').val('')
  })

  $('#line_text').keypress(async (e) => {
    if (e.which == 13) {
      await sendLine($(e.currentTarget).val())
      $(e.currentTarget).val('')
    }
  });
});
