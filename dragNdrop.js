//DRAG 2
(function() {
  var dndHandler = {
    draggedElement: null, // Propriété pointant vers l'élément en cours de déplacement
    applyDragEvents: function(element) {
      element.draggable = true;

      var dndHandler = this; // Cette variable est nécessaire pour que l'événement « dragstart » ci-dessous accède facilement au namespace « dndHandler »

      element.addEventListener('dragstart', function(e) {
        dndHandler.draggedElement = e.target; // On sauvegarde l'élément en cours de déplacement
        e.dataTransfer.setData('text/plain', ''); // Nécessaire pour Firefox
      });
    },

    applyDropEvents: function(dropper) {
      dropper.addEventListener('dragover', function(e) {
        e.preventDefault(); // On autorise le drop d'éléments
        this.className = 'dropper drop_hover'; // Et on applique le style adéquat à notre zone de drop quand un élément la survole
      });

      dropper.addEventListener('dragleave', function() {
        this.className = 'dropper'; // On revient au style de base lorsque l'élément quitte la zone de drop
      });

      var dndHandler = this; // Cette variable est nécessaire pour que l'événement « drop » ci-dessous accède facilement au namespace « dndHandler »

      dropper.addEventListener('drop', function(e) {
        var target = e.target,
        draggedElement = dndHandler.draggedElement, // Récupération de l'élément concerné
        clonedElement = draggedElement.cloneNode(true); // On créé immédiatement le clone de cet élément

        while (target.className.indexOf('dropper') == -1) { // Cette boucle permet de remonter jusqu'à la zone de drop parente
          target = target.parentNode;
        }

        target.className = 'dropper'; // Application du style par défaut

        clonedElement = target.appendChild(clonedElement); // Ajout de l'élément cloné à la zone de drop actuelle
        dndHandler.applyDragEvents(clonedElement); // Nouvelle application des événements qui ont été perdus lors du cloneNode()

        draggedElement.parentNode.removeChild(draggedElement); // Suppression de l'élément d'origine
      });
    }
  };

  var elements = document.querySelectorAll('.draggable'),
  elementsLen = elements.length;

  for (var i = 0; i < elementsLen; i++) {
    dndHandler.applyDragEvents(elements[i]); // Application des paramètres nécessaires aux éléments déplaçables
  }

  var droppers = document.querySelectorAll('.dropper'),
  droppersLen = droppers.length;

  for (var i = 0; i < droppersLen; i++) {
    dndHandler.applyDropEvents(droppers[i]); // Application des événements nécessaires aux zones de drop
  }
})();

//DRAG 1
var Sortable = function(element) {
  var self = this;
  this.element = element;
  this.items = this.element.querySelectorAll(this.element.dataset.sortable);
  this.item_width = this.items[0].offsetWidth;
  this.item_height = this.items[0].offsetHeight;
  this.cols = Math.floor(this.element.offsetWidth / this.item_width);
  this.element.style.height = (this.item_height * Math.ceil(this.items.length / this.cols)) + "px";
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    item.style.position = "absolute";
    item.style.top = "0px";
    item.style.left = "0px";
    this.moveItem(item, item.dataset.position);
  }
  interact(this.element.dataset.sortable, {
    context: this.element
  }).draggable({
    inertia: false,
    manualStart: false,
    onmove: function(e) {
      self.move(e)
    }
  }).on('dragstart', function(e) {
    var r = e.target.getBoundingClientRect();
    e.target.classList.add('is-dragged');
    self.startPosition = e.target.dataset.position;
    self.offset = {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
    };
  }).on('dragend', function(e) {
    e.target.classList.remove('is-dragged');
    self.moveItem(e.target, e.target.dataset.position);
  })
};
Sortable.prototype.move = function(e) {
  var p = this.getXY(this.startPosition);
  var x = p.x + e.clientX - e.clientX0;
  var y = p.y + e.clientY - e.clientY0;
  e.target.style.transform = "translate3D("+ x + "px," + y + "px, 0)";
  var oldPosition = e.target.dataset.position;
  var newPosition = this.guessPosition(x + this.offset.x, y + this.offset.y);
  if (oldPosition != newPosition) {
    this.swap(oldPosition, newPosition);
    e.target.dataset.position = newPosition;
  }
  this.guessPosition(x,y);
};
Sortable.prototype.getXY = function(position) {
  var x = this.item_width * (position % this.cols);
  var y = this.item_height * Math.floor(position / this.cols);
  return {
    "x": x,
    "y": y
  }
};
Sortable.prototype.guessPosition = function(x, y) {
  var col = Math.floor(x / this.item_width);
  if(col >= this.cols) {
    col = this.cols-1;
  }
  if(col <= 0) {
    col = 0;
  }
  var row = Math.floor(y / this.item_height);
  if(row < 0) {
    row = 0;
  }

  var position = col + row * this.cols;
  if (position >= this.items.length) {
    return this.items.length-1;
  }
  return position;
};
Sortable.prototype.swap = function(startPosition, endPosition) {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (!item.classList.contains('is-dragged')) {
      var position = parseInt(item.dataset.position);
      if (position >= endPosition && position < startPosition && endPosition < startPosition) {
        this.moveItem(item, position + 1)
      } else if (position <= endPosition && position > startPosition && startPosition < endPosition) {
        this.moveItem(item, position-1);
      }
    }
  }
};
Sortable.prototype.moveItem = function(item, position){
  var p = this.getXY(position);
  item.style.transform = "translate3D("+ p.x + "px, " + p.y + "px, 0)";
  item.dataset.position = position;
};

//DRAG 3
var dropper = document.querySelector('#dropper');
dropper.addEventListener('dragover', function(e) {
  e.preventDefault(); // Annule l'interdiction de "drop"
});

dropper.addEventListener('drop', function(e) {
  e.preventDefault();

  var files = e.dataTransfer.files,
  filesLen = files.length,
  filenames = "";

  for(var i = 0 ; i < filesLen ; i++) {
    filenames += '\n' + files[i].name;
  }
  alert(files.length + ' fichier(s) :\n' + filenames);
});
