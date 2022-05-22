'esversion: 6';
load_file();
function load_file(){

    fetch('tormim.txt')
      .then(response => response.text())
      .then(data => {
        var content = data.split("\n").join("<br>");
        console.log(content);
        document.getElementById('output')
            .innerHTML=content;
      });
}