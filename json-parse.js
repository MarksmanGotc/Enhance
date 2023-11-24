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
    var newBuildingDiv = document.createElement('div');
    newBuildingDiv.className = 'buildingBlock';

    newBuildingDiv.innerHTML = `
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

    var container = document.getElementById('buildingBlocksContainer'); // Oletetaan, että tämä on kontti, johon uudet lohkot lisätään
    container.appendChild(newBuildingDiv);

    var newBuildingSelect = newBuildingDiv.querySelector('.buildingSelect');
    var newEnhancementSelect = newBuildingDiv.querySelector('.enhancementSelect');

    loadBuildings(newBuildingSelect);
    newBuildingSelect.addEventListener('change', function() {
        loadEnhancements(newEnhancementSelect);
    });
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
        <p>Please note that the calculation for Valyrian Stone is missing, as it is not defined in the price list.</p>
        ${aleMarble > 0 || aleKeystone > 0 ? `<p>Note: Discount percentages may not accurately reflect in-game calculations due to a known bug.</p>` : ''}
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

        for (let j = currentLevel - 1; j < targetLevel - 1; j++) {
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
            <p class="stats">Stats increase: ${stats.toFixed(2)}%</p>
        `;

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
        costSummaryElement.appendChild(totalCostDiv);
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
});
