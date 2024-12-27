document.addEventListener("DOMContentLoaded", function() {
    const slideRule = document.getElementById('inner_plate');
    const container = document.getElementById('slideRuleContainer');

    let isDragging = false;
    let startAngle = 0;
    let currentRotation = 0;

    const getMouseAngle = function(event) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        return Math.atan2(mouseY, mouseX) * 180 / Math.PI;
    };

    container.addEventListener('mousedown', function(event) {
        isDragging = true;
        startAngle = getMouseAngle(event) - currentRotation;
    });

    document.addEventListener('mousemove', function(event) {
        if (isDragging) {
            const mouseAngle = getMouseAngle(event);
            currentRotation = mouseAngle - startAngle;
            slideRule.setAttribute('transform', 'rotate(' + currentRotation + ')');
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
});
