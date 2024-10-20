document.addEventListener('DOMContentLoaded', function() {
    // Kun footerin sisällä olevaa SVG:tä painetaan
    document.querySelectorAll('footer svg, #openGiftFromHeader').forEach(element => {
		element.addEventListener('click', function() {
			const pageDivs = document.querySelectorAll('.page > div');
			const giftDiv = document.querySelector('.page .gift');

			pageDivs.forEach(div => {
				div.style.display = 'none';
			});

			giftDiv.style.display = 'flex';
		});
	});

    document.querySelector('.gift button').addEventListener('click', function() {
        const pageDivs = document.querySelectorAll('.page > div');
        const wrapperDiv = document.querySelector('.page .wrapper');

        pageDivs.forEach(div => {
            div.style.display = 'none';
        });

        wrapperDiv.style.display = 'block';
    });
});


function loadBuildings(buildingSelectElement) {
    buildingSelectElement.innerHTML = '';
    for (let building in build) {
        let option = document.createElement('option');
        option.value = building;
        option.textContent = building;
        buildingSelectElement.appendChild(option);
    }

    var enhancementSelect = buildingSelectElement.parentNode.parentNode.querySelector('.enhancementSelect');
    loadEnhancements(enhancementSelect);
}

function loadEnhancements(enhancementSelect) {
    var buildingSelect = enhancementSelect.parentNode.parentNode.querySelector('.buildingSelect');
    let selectedBuilding = buildingSelect.value;
    
    enhancementSelect.innerHTML = '';
    let enhancements = build[selectedBuilding];
    for (let enhancement in enhancements) {
        let option = document.createElement('option');
        option.value = enhancements[enhancement];
        option.textContent = enhancement;
        enhancementSelect.appendChild(option);
    }	
}

function addAnotherBuilding() {
    document.querySelectorAll('.buildingBlock.start').forEach(function(element) {
        element.classList.remove('start');
    });
    document.querySelectorAll('.buildingBlock.animated').forEach(function(element) {
        element.classList.remove('animated');
    });

    var newBuildingDiv = document.createElement('div');
    newBuildingDiv.className = 'buildingBlock animated';

    var container = document.getElementById('buildingBlocksContainer');

    // Luo ja lisää poistonappi
    var removeButton = document.createElement('div');
    removeButton.innerHTML = '<p><svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512"><!--!Font Awesome Pro 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.--><path d="M326.6 166.6L349.3 144 304 98.7l-22.6 22.6L192 210.7l-89.4-89.4L80 98.7 34.7 144l22.6 22.6L146.7 256 57.4 345.4 34.7 368 80 413.3l22.6-22.6L192 301.3l89.4 89.4L304 413.3 349.3 368l-22.6-22.6L237.3 256l89.4-89.4z"/></svg></p>';
    removeButton.className = 'removeButton';

	document.getElementById('buildingBlocksContainer').addEventListener('click', function(event) {
		if (event.target.closest('.removeButton')) {
			var buildingBlock = event.target.closest('.buildingBlock');
			if (buildingBlock) {
				buildingBlock.remove();
				gtag('event', 'remove_building_click', {
					'event_label': 'remove Building'
				});
			}
		}
	});

    newBuildingDiv.appendChild(removeButton);

    newBuildingDiv.innerHTML += `
        <div class="selectBuilds">
            <div class="selectBuild">
                <label for="buildingSelect">Select Building:</label>
                <select class="buildingSelect"></select>
            </div>
            <div class="selectEnhance">
                <label for="enhancementSelect">Select Enhancement:</label>
                <select class="enhancementSelect"></select>
            </div>
        </div>
        <div class="selectLevel">
            <div class="currentLevel">
                <label for="currentLevel">Current level:</label>
                <input type="number" class="currentLevel" min="0" max="34" value="0">
            </div>
            <div class="targetLevel">
                <label for="targetLevel">Update level:</label>
                <input type="number" class="targetLevel" min="2" max="40" value="40">
            </div>
        </div>`;

    container.appendChild(newBuildingDiv);

    var newBuildingSelect = newBuildingDiv.querySelector('.buildingSelect');
    var newEnhancementSelect = newBuildingDiv.querySelector('.enhancementSelect');

    loadBuildings(newBuildingSelect);
    newBuildingSelect.addEventListener('change', function() {
        loadEnhancements(newEnhancementSelect);
    });
	
	adjustLevelInputs(newBuildingDiv);
	
    gtag('event', 'add_building_click', {
        'event_label': 'Add Building'
    });

    var scrollTargetPosition = newBuildingDiv.offsetTop - 20;
    window.scrollTo({ top: scrollTargetPosition, behavior: 'smooth' });

    setTimeout(() => newBuildingDiv.classList.remove('animated'), 4000);
}


function calculateCost() {
    var totalCosts = { slate: 0, marble: 0, limestone: 0, brick: 0, pine: 0, keystone: 0, valyrianStone: 0 };
    var totalDiscounts = { slate: 0, marble: 0, limestone: 0, keystone: 0, valyrianStone: 0 };
    var totalStatsList = [];
    var costSummaryElement = document.getElementById('costSummary');
    var numberFormatter = new Intl.NumberFormat('en-US');
	var costSummaryElement = document.getElementById('costSummary');
    var wrapperElement = document.querySelector('.wrapper');
	
    costSummaryElement.innerHTML = '';

    var buildingBlocks = document.querySelectorAll('.buildingBlock');
    for (let i = 0; i < buildingBlocks.length; i++) {
        let block = buildingBlocks[i];
        let enhancementSelect = block.querySelector('.enhancementSelect');
        let currentLevelInput = block.querySelector('.currentLevel input');
        let targetLevelInput = block.querySelector('.targetLevel input');
        let currentLevel = parseInt(currentLevelInput.value, 10);
        let targetLevel = parseInt(targetLevelInput.value, 10);

        var blockCosts = { slate: 0, marble: 0, limestone: 0, brick: 0, pine: 0, keystone: 0, valyrianStone: 0 };
        var statsIncrease = {};
        var individualStatsList = [];

        // Hae rakennuksen nimi
        let buildingSelect = block.querySelector('.buildingSelect');
        let selectedBuilding = buildingSelect.value;

        // Tarkistetaan, onko kyseessä "Enhancement 4"
        let isEnhancement4 = enhancementSelect.options[enhancementSelect.selectedIndex].text === "Enhancement 4";
        
        if (isEnhancement4) {
            let enhancement4Price = enhancement4Prices.Special;
            let enhancementData = build[selectedBuilding]["Enhancement 4"];  // Käytetään valittua rakennusta

            for (let j = currentLevel; j < targetLevel; j++) {
                blockCosts.slate += enhancement4Price[j].Slate;
                blockCosts.marble += enhancement4Price[j].Marble;
                blockCosts.limestone += enhancement4Price[j].Limestone;
                blockCosts.brick += enhancement4Price[j].Brick;
                blockCosts.pine += enhancement4Price[j].Pine;
                blockCosts.keystone += enhancement4Price[j].Keystone;
                blockCosts.valyrianStone += enhancement4Price[j]["Valyrian Stone"] || 0;

                let enhancements = enhancementData[j].Enhancements;
                enhancements.forEach((enh) => {
                    let type = enh.Type;
                    let value = typeof enh.Value === 'string' ? parseFloat(enh.Value.replace('%', '')) : parseFloat(enh.Value);

                    if (!statsIncrease[type]) {
                        statsIncrease[type] = 0;
                    }

                    if (enhancementData[j + 1]) {
                        let nextEnh = enhancementData[j + 1].Enhancements.find(e => e.Type === type);
                        if (nextEnh) {
                            let nextValue = typeof nextEnh.Value === 'string' ? parseFloat(nextEnh.Value.replace('%', '')) : parseFloat(nextEnh.Value);
                            statsIncrease[type] += nextValue - value;
                        }
                    }
                });
            }

            // Lisää stats-nousut listalle, mutta vain jos arvo ei ole nolla
            for (let type in statsIncrease) {
                let statValue = statsIncrease[type];
                if (statValue !== 0) {
                    if (type === "Barracks Training Capacity" || 
					type === "March Size vs. Seats of Power" || 
					type === "Rallied Troops vs. Seats of Power" || 
					type === "Free Build Time" || 
					type === "Rallied Troop Capacity" ||
					type === "Range Training Capacity" ||
					type === "Wounded Capacity" ||
					type === "Dragon: Max March Size" ||
					type === "Stable Training Capacity" ||
					type === "Training Capacity" ||
					type === "Reinforcement Capacity for Seats of Power" ||
					type === "Rally Slots" ||
					type === "Single March Size vs. Player" ||
					type === "March Slots" ||
					type === "Workshop Training Capacity") {
                        individualStatsList.push(`${type}: ${statValue.toLocaleString('en-US')}`);
                    } else {
                        individualStatsList.push(`${type}: ${statValue.toFixed(2)}%`);
                    }
                }
            }

            individualStatsList.forEach(stat => totalStatsList.push(stat));
        } else {
            // Käsitellään muut kuin "Enhancement 4"
            let selectedPrice = price[enhancementSelect.value];

            for (let j = currentLevel; j < targetLevel; j++) {
                blockCosts.slate += selectedPrice[j].Slate;
                blockCosts.marble += selectedPrice[j].Marble;
                blockCosts.limestone += selectedPrice[j].Limestone;
                blockCosts.brick += selectedPrice[j].Brick;
                blockCosts.pine += selectedPrice[j].Pine;
                blockCosts.keystone += selectedPrice[j].Keystone;
                blockCosts.valyrianStone += selectedPrice[j]["Valyrian Stone"] || 0;
            }

            var stats = selectedPrice[targetLevel - 1].Value - (currentLevel > 0 ? selectedPrice[currentLevel - 1].Value : 0);
            if (stats !== 0) {
                let statText = `${enhancementSelect.options[enhancementSelect.selectedIndex].text}: ${stats.toFixed(2)}%`;
                individualStatsList.push(statText);
                totalStatsList.push(statText);
            }
        }

        var blockDiscounts = { slate: 0, marble: 0, limestone: 0, keystone: 0, valyrianStone: 0 };

		let hasDiscount = false;

		for (let key in blockCosts) {
			let originalCost = blockCosts[key];
			let discount = 0;

			if (key === 'marble') {
				discount = parseFloat(document.querySelector('.aleMarble').value) || 0;
			} else if (key === 'keystone') {
				discount = parseFloat(document.querySelector('.aleKeystone').value) || 0;
			} else if (key === 'slate') {
				discount = parseFloat(document.querySelector('.aleSlate').value) || 0;
			}

			// Lasketaan alennettu hinta käyttäen uutta kaavaa
			let discountedCost = Math.round((100 / (discount + 100)) * originalCost);

			blockDiscounts[key] = originalCost - discountedCost;
			blockCosts[key] = discountedCost;

			totalCosts[key] += discountedCost;
			totalDiscounts[key] += blockDiscounts[key];

			// Tarkista onko jokin alennus käytössä
			if (discount > 0) {
				hasDiscount = true;
			}
		}

		// Lisää varoitusteksti vain kerran
		if (hasDiscount) {
			let buttonsDiv = document.querySelector('.buttons');
			if (buttonsDiv && !document.querySelector('.warning')) { // Tarkista, onko varoitustekstiä jo olemassa
				let warningText = document.createElement('p');
				warningText.className = 'warning';
				warningText.textContent = 'The discounted value is not completely accurate, WB does not provide the correct discount value.';
				buttonsDiv.insertAdjacentElement('afterend', warningText);
			}
		}


        var enhancementText = enhancementSelect.options[enhancementSelect.selectedIndex].text;
        var buildingText = block.querySelector('.buildingSelect').options[block.querySelector('.buildingSelect').selectedIndex].text;

        var blockCostDiv = document.createElement('div');
        blockCostDiv.classList.add('costBox');
        blockCostDiv.innerHTML = `
            <h4>${buildingText} - ${enhancementText}</h4>
            <p class="level">Level ${currentLevel} to ${targetLevel}</p>
        `;

        // Lisää stats-nousut korttiin
		if (individualStatsList.length > 1) {
			blockCostDiv.innerHTML += `<p class="stats">Stats increase:</p><div class="stats">${individualStatsList.map(stat => `<p>${stat}</p>`).join('')}</div>`;
		} else if (individualStatsList.length === 1) {
			blockCostDiv.innerHTML += `<p class="stats">Stats increase: ${individualStatsList[0]}</p>`;
		}


        // Lisää kustannukset ja alennukset
        for (let key in blockCosts) {
            blockCostDiv.innerHTML += `
                <p>${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(blockCosts[key])}</p>
                ${blockDiscounts[key] > 0 ? `<span>Cost Efficiency saved on ${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(blockDiscounts[key])}</span>` : ''}
            `;
        }

		
        costSummaryElement.appendChild(blockCostDiv);
    }

    // Luo ja lisää kokonaiskustannusten ja kokonaistatistiikan osio
    if (buildingBlocks.length > 1) {
        var totalCostDiv = document.createElement('div');
        totalCostDiv.classList.add('totalCosts');
        var statsListHtml = totalStatsList.map(stat => `<p class="stats">${stat}</p>`).join('');
        totalCostDiv.innerHTML = `
            <h3>Costs in total:</h3>
            ${statsListHtml}
        `;

        for (let key in totalCosts) {
            totalCostDiv.innerHTML += `
                <p>${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(totalCosts[key])}</p>
                ${totalDiscounts[key] > 0 ? `<span>Cost Efficiency saved on ${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(totalDiscounts[key])}</span>` : ''}
            `;
        }
        costSummaryElement.appendChild(totalCostDiv);
    }
	
	
	if (!document.getElementById('closeResults')) {
		let closeButton = document.createElement('button');
		closeButton.id = 'closeResults';

		// Luo tekstielementti ja svg kuvake napin sisään
		closeButton.innerHTML = `
			<span>Click here to go back and modify your selections</span>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
				<path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>
			</svg>`;

		let closeWrapper = document.createElement('div');
		closeWrapper.appendChild(closeButton);

		closeWrapper.classList.add('closeWrapper');

		closeWrapper.addEventListener('click', function() {
			wrapperElement.style.display = 'block';
			costSummaryElement.style.display = 'none';
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		costSummaryElement.prepend(closeWrapper);
	}



    // Piilotetaan wrapper ja näytetään costSummary
    wrapperElement.style.display = 'none';
    costSummaryElement.style.display = 'flex';
	
	window.scrollTo({ top: 0, behavior: 'smooth' });
	
}
// Kutsu funktioita sivun latautuessa
document.addEventListener('DOMContentLoaded', function() {
    var buildingSelectElements = document.querySelectorAll('.buildingSelect');
    buildingSelectElements.forEach(function(buildingSelectElement) {
        loadBuildings(buildingSelectElement);
    });

	document.querySelectorAll('.buildingSelect').forEach(function(buildingSelectElement) {
		buildingSelectElement.addEventListener('change', function() {
			var enhancementSelect = this.parentNode.parentNode.querySelector('.enhancementSelect');
			loadEnhancements(enhancementSelect);
		});
	});

    // Aseta currentLevel ja targetLevel -kenttien säätölogiikka kaikille buildingBlock-elementeille
    document.querySelectorAll('.buildingBlock').forEach(adjustLevelInputs);
})


function adjustLevelInputs(buildingBlock) {
    var currentLevelInput = buildingBlock.querySelector('.currentLevel input');
    var targetLevelInput = buildingBlock.querySelector('.targetLevel input');

    currentLevelInput.addEventListener('change', function() {
        var currentLevel = parseInt(currentLevelInput.value, 10);
        targetLevelInput.min = currentLevel+1;

        if (parseInt(targetLevelInput.value, 10) <= currentLevel) {
            targetLevelInput.value = currentLevel+1;
        }
    });
	targetLevelInput.addEventListener('change', function() {
        var currentLevel = parseInt(currentLevelInput.value, 10);
        var targetLevel = parseInt(targetLevelInput.value, 10);
        if (targetLevel <= currentLevel) {
            targetLevelInput.value = currentLevel + 1;
        }
    });
}


function smoothScrollTo(elementId) {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500;
    let start = null;

    window.requestAnimationFrame(step);

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const fraction = easeInOutCubic(progress / duration);
        window.scrollTo(0, startPosition + distance * fraction);
        if (progress < duration) window.requestAnimationFrame(step);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
