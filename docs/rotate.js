document.addEventListener("DOMContentLoaded", function () {
    const innerPlate = document.getElementById('inner_plate');
    const outerPlate = document.getElementById('outer_plate');
    const container = document.getElementById('slideRuleContainer');

    let isDragging = false;
    let startAngle = 0;
    let currentRotation = 0;
    let targetElement = null;

    const getMouseAngle = function (event) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        return Math.atan2(mouseY, mouseX) * 180 / Math.PI;
    };

    innerPlate.addEventListener('mousedown', function (event) {
        targetElement = innerPlate;
        isDragging = true;
        startAngle = getMouseAngle(event) - currentRotation;
    });

    outerPlate.addEventListener('mousedown', function (event) {
        targetElement = outerPlate;
        isDragging = true;
        startAngle = getMouseAngle(event) - currentRotation;
    });

    document.addEventListener('mousemove', function (event) {
        if (isDragging && targetElement) {
            const mouseAngle = getMouseAngle(event);
            currentRotation = mouseAngle - startAngle;
            targetElement.setAttribute('transform', 'rotate(' + currentRotation + ')');
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
        targetElement = null;
    });
});
