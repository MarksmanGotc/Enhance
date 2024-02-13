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
                <input type="number" class="currentLevel" min="1" max="35" value="1">
            </div>
            <div class="targetLevel">
                <label for="targetLevel">Update level:</label>
                <input type="number" class="targetLevel" min="1" max="35" value="35">
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
    var aleSlate = parseFloat(document.querySelector('.aleSlate').value) / 100;
    var aleMarble = parseFloat(document.querySelector('.aleMarble').value) / 100;
    var aleKeystone = parseFloat(document.querySelector('.aleKeystone').value) / 100;
    var totalCosts = { slate: 0, marble: 0, brick: 0, pine: 0, keystone: 0 };
    var totalDiscounts = { slate: 0, marble: 0, keystone: 0 };
    var totalStatsList = [];
    var costSummaryElement = document.getElementById('costSummary');
    var numberFormatter = new Intl.NumberFormat('en-US');

    // Lisää huomautukset Valyrian Stonen puuttumisesta ja alennusprosentin epätarkkuudesta
    costSummaryElement.innerHTML = `
   	 <p>Please note: The calculation for Valyrian Stone is missing, as it is not defined in the price list.</p>
  	  ${aleMarble > 0 || aleKeystone > 0 ? `<p>Please note: Discount percentages may not accurately reflect in-game calculations due to a known bug.</p>` : ''}
     `;
	

    var buildingBlocks = document.querySelectorAll('.buildingBlock');
    for (let i = 0; i < buildingBlocks.length; i++) {
        let block = buildingBlocks[i];
        let enhancementSelect = block.querySelector('.enhancementSelect');
        let currentLevelInput = block.querySelector('.currentLevel input');
        let targetLevelInput = block.querySelector('.targetLevel input');
        let currentLevel = parseInt(currentLevelInput.value);
        let targetLevel = parseInt(targetLevelInput.value);
        let selectedPrice = price[enhancementSelect.value];
        var blockCosts = { slate: 0, marble: 0, brick: 0, pine: 0, keystone: 0 };
		
	let currentLevelCheck = parseInt(currentLevelInput.value, 10);
        let targetLevelCheck = parseInt(targetLevelInput.value, 10);
		
	if (isNaN(currentLevelCheck) || isNaN(targetLevelCheck) || currentLevelCheck < 1 || targetLevelCheck < currentLevel) {
            alert("Please check the levels for each building. Target level must be greater than current level.");
            return;
        }
		
        for (let j = currentLevel; j < targetLevel; j++) {
            blockCosts.slate += selectedPrice[j].Slate;
            blockCosts.marble += selectedPrice[j].Marble;
            blockCosts.brick += selectedPrice[j].Brick;
            blockCosts.pine += selectedPrice[j].Pine;
            blockCosts.keystone += selectedPrice[j].Keystone;
        }

        // Laske alennukset ja päivitä kokonaisalennukset
        var blockDiscounts = { slate: 0, marble: 0, keystone: 0 };
        for (let key in blockCosts) {
            let originalCost = blockCosts[key];
            let discount = key === 'marble' ? aleMarble : (key === 'keystone' ? aleKeystone : 0);
            blockDiscounts[key] = Math.round(originalCost * discount);
            blockCosts[key] = Math.round(originalCost - blockDiscounts[key]);
            totalCosts[key] += blockCosts[key];
            totalDiscounts[key] += blockDiscounts[key];
			
        }

        var stats = selectedPrice[targetLevel - 1].Value - selectedPrice[currentLevel - 1].Value;
        var enhancementText = enhancementSelect.options[enhancementSelect.selectedIndex].text;
        var buildingText = block.querySelector('.buildingSelect').options[block.querySelector('.buildingSelect').selectedIndex].text;

        // Tallenna statsit listalle
        totalStatsList.push(`${enhancementText} +${stats.toFixed(2)}%`);

        var blockCostDiv = document.createElement('div');
        blockCostDiv.classList.add('costBox');
        blockCostDiv.innerHTML = `
            <h4>${buildingText} - ${enhancementText}</h4>
	    <p class="level">Level ${currentLevel} to ${targetLevel}</p>
            <p class="stats">Stats increase: ${stats.toFixed(2)}%</p>
        `;
		
		
		gtag('event', 'enhance_calc', {
			'enhance_upgrade': `${buildingText} - ${enhancementText}; Level ${currentLevel} to ${targetLevel}`,
			'enhance_value': `${buildingText} - ${enhancementText}; Level ${currentLevel} to ${targetLevel}`,
			'value': 1
		});

        // Lisää kustannukset ja alennukset costBoxiin
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

        // Lisää kokonaiskustannukset ja kokonaisalennukset
        for (let key in totalCosts) {
            totalCostDiv.innerHTML += `
                <p>${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(totalCosts[key])}</p>
                ${totalDiscounts[key] > 0 ? `<span>Cost Efficiency saved on ${key.charAt(0).toUpperCase() + key.slice(1)}: ${numberFormatter.format(totalDiscounts[key])}</span>` : ''}
            `;
        }
		gtag('event', 'enhance_count', {
			'event_value': buildingBlocks.length
		});

        costSummaryElement.appendChild(totalCostDiv);
		smoothScrollTo('costSummary');
    }
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
    var currentLevelInput = buildingBlock.querySelector('.currentLevel');
    var targetLevelInput = buildingBlock.querySelector('.targetLevel');

    currentLevelInput.addEventListener('change', function() {
        var currentLevel = parseInt(currentLevelInput.value, 10);
        targetLevelInput.min = currentLevel;

        if (parseInt(targetLevelInput.value, 10) < currentLevel) {
            targetLevelInput.value = currentLevel;
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
