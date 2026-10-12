class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        type
    ) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.type = type;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.scatterCorner = [
            {
                x: (map[0].length - 2) * oneBlockSize,
                y: 1 * oneBlockSize
            },
            { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
            {
                x: (map[0].length - 2) * oneBlockSize,
                y: (map.length - 2) * oneBlockSize
            },
            { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize }
        ][type];
        this.target = { x: this.scatterCorner.x, y: this.scatterCorner.y };
        this.roamTarget = null;
        this.homeX = 10 * oneBlockSize;
        this.homeY = 10 * oneBlockSize;
        this.isEaten = false;
        this.respawnFrames = 0;
        this.respawnDelay = 90;
        this.lastX = x;
        this.lastY = y;
        this.stuckFrames = 0;
        this.recoveries = 0;
        this.directionInterval = setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    recover() {
        let tileX = this.getMapX();
        let tileY = this.getMapY();
        let neighbors = [
            { direction: DIRECTION_UP, x: tileX, y: tileY - 1 },
            { direction: DIRECTION_BOTTOM, x: tileX, y: tileY + 1 },
            { direction: DIRECTION_LEFT, x: tileX - 1, y: tileY },
            { direction: DIRECTION_RIGHT, x: tileX + 1, y: tileY },
        ];
        for (let i = 0; i < neighbors.length; i++) {
            let n = neighbors[i];
            if (
                n.y >= 0 &&
                n.y < map.length &&
                n.x >= 0 &&
                n.x < map[0].length &&
                map[n.y][n.x] != 1
            ) {
                this.x = n.x * oneBlockSize;
                this.y = n.y * oneBlockSize;
                this.direction = n.direction;
                this.recoveries++;
                return;
            }
        }
        this.x = this.homeX;
        this.y = this.homeY;
        this.direction = DIRECTION_UP;
        this.recoveries++;
    }

    isEatenNow() {
        return this.isEaten;
    }

    beEaten() {
        this.x = this.homeX;
        this.y = this.homeY;
        this.isEaten = true;
        this.respawnFrames = this.respawnDelay;
    }

    updateRespawn() {
        if (this.isEaten) {
            this.respawnFrames--;
            if (this.respawnFrames <= 0) {
                this.x = this.startX;
                this.y = this.startY;
                this.isEaten = false;
                this.roamTarget = null;
                this.stuckFrames = 0;
                this.lastX = this.x;
                this.lastY = this.y;
                this.speed = snapGhostSpeed(pacman.speed / 2);
            }
        }
    }

    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    pickRoamTarget() {
        let tileX = this.getMapX();
        let tileY = this.getMapY();
        for (let i = 0; i < randomTargetsForGhosts.length; i++) {
            this.changeRandomDirection();
            let target = randomTargetsForGhosts[this.randomTargetIndex];
            if (
                Math.floor(target.x / oneBlockSize) != tileX ||
                Math.floor(target.y / oneBlockSize) != tileY
            ) {
                return target;
            }
        }
        return randomTargetsForGhosts[this.randomTargetIndex];
    }

    isFrightened() {
        return typeof isFrightened === "function" && isFrightened();
    }

    getFleeTarget() {
        let best = randomTargetsForGhosts[0];
        let bestDistance = -1;
        for (let i = 0; i < randomTargetsForGhosts.length; i++) {
            let target = randomTargetsForGhosts[i];
            let dx = target.x - pacman.x;
            let dy = target.y - pacman.y;
            let distance = dx * dx + dy * dy;
            if (distance > bestDistance) {
                bestDistance = distance;
                best = target;
            }
        }
        return best;
    }

    isAtTile(tileX, tileY) {
        return this.getMapX() == tileX && this.getMapY() == tileY;
    }

    isAlignedToGrid() {
        let tol = 0.001;
        let mx = ((this.x % oneBlockSize) + oneBlockSize) % oneBlockSize;
        let my = ((this.y % oneBlockSize) + oneBlockSize) % oneBlockSize;
        return (
            (mx < tol || mx > oneBlockSize - tol) &&
            (my < tol || my > oneBlockSize - tol)
        );
    }

    isValidTarget() {
        let tileX = Math.floor(this.target.x / oneBlockSize);
        let tileY = Math.floor(this.target.y / oneBlockSize);
        return (
            tileX >= 0 &&
            tileX < map[0].length &&
            tileY >= 0 &&
            tileY < map.length &&
            map[tileY][tileX] != 1
        );
    }

    isTargetReachable() {
        return (
            typeof this.calculateNewDirection(
                map,
                Math.floor(this.target.x / oneBlockSize),
                Math.floor(this.target.y / oneBlockSize)
            ) != "undefined"
        );
    }

    getScatterTarget() {
        return { x: this.scatterCorner.x, y: this.scatterCorner.y };
    }

    getChaseTarget() {
        switch (this.type) {
            case 0:
                return { x: pacman.x, y: pacman.y };
            case 1:
                return this.getAheadTarget(4);
            case 2:
                return this.getInkyTarget();
            case 3:
                return this.getClydeTarget();
        }
    }

    getAheadTarget(distance) {
        let targetX = pacman.getMapX();
        let targetY = pacman.getMapY();
        switch (pacman.direction) {
            case DIRECTION_RIGHT:
                targetX += distance;
                break;
            case DIRECTION_LEFT:
                targetX -= distance;
                break;
            case DIRECTION_UP:
                targetY -= distance;
                break;
            case DIRECTION_BOTTOM:
                targetY += distance;
                break;
        }
        return { x: targetX * oneBlockSize, y: targetY * oneBlockSize };
    }

    getInkyTarget() {
        let pivot = this.getAheadTarget(2);
        let blinky = ghosts[0];
        return {
            x: pivot.x + (pivot.x - blinky.x),
            y: pivot.y + (pivot.y - blinky.y)
        };
    }

    getClydeTarget() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) > 8
        ) {
            return { x: pacman.x, y: pacman.y };
        }
        return this.getScatterTarget();
    }

    moveProcess() {
        if (this.isEaten) {
            return;
        }
        if (this.roamTarget) {
            this.target = this.roamTarget;
            if (
                this.isAtTile(
                    Math.floor(this.target.x / oneBlockSize),
                    Math.floor(this.target.y / oneBlockSize)
                )
            ) {
                this.roamTarget = null;
            }
        } else {
            if (this.isFrightened()) {
                this.target = this.getFleeTarget();
            } else {
                this.target = inScatterPhase()
                    ? this.getScatterTarget()
                    : this.getChaseTarget();
            }
            if (
                this.isAtTile(
                    Math.floor(this.target.x / oneBlockSize),
                    Math.floor(this.target.y / oneBlockSize)
                )
            ) {
                this.roamTarget = this.pickRoamTarget();
                this.target = this.roamTarget;
            }
        }
        if (!this.isValidTarget() || !this.isTargetReachable()) {
            this.roamTarget = this.pickRoamTarget();
            this.target = this.roamTarget;
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        } else {
            this.wrapAround();
        }
        this.updateStuckState();
    }

    updateStuckState() {
        if (
            Math.abs(this.x - this.lastX) < 0.5 &&
            Math.abs(this.y - this.lastY) < 0.5
        ) {
            this.stuckFrames++;
            if (this.stuckFrames > 15) {
                this.recover();
                this.stuckFrames = 0;
            }
        } else {
            this.stuckFrames = 0;
        }
        this.lastX = this.x;
        this.lastY = this.y;
    }

    wrapAround() {
        let mapPixelWidth = map[0].length * oneBlockSize;
        if (this.x + oneBlockSize <= 0) {
            this.x += mapPixelWidth;
        } else if (this.x >= mapPixelWidth) {
            this.x -= mapPixelWidth;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case 4: // Right
                this.x -= this.speed;
                break;
            case 3: // Up
                this.y += this.speed;
                break;
            case 2: // Left
                this.x += this.speed;
                break;
            case 1: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: // Right
                this.x += this.speed;
                break;
            case 3: // Up
                this.y -= this.speed;
                break;
            case 2: // Left
                this.x -= this.speed;
                break;
            case 1: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        let newDirection = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        if (typeof newDirection == "undefined") {
            this.direction = tempDirection;
            return;
        }
        this.direction = newDirection;

        let remX = ((this.x % oneBlockSize) + oneBlockSize) % oneBlockSize;
        let remY = ((this.y % oneBlockSize) + oneBlockSize) % oneBlockSize;
        let goingVertical =
            this.direction == DIRECTION_UP ||
            this.direction == DIRECTION_BOTTOM;
        let goingHorizontal =
            this.direction == DIRECTION_LEFT ||
            this.direction == DIRECTION_RIGHT;
        let wasHorizontal =
            tempDirection == DIRECTION_LEFT ||
            tempDirection == DIRECTION_RIGHT;
        let wasVertical =
            tempDirection == DIRECTION_UP ||
            tempDirection == DIRECTION_BOTTOM;

        // Non si può curvare a metà casella: prima ci si allinea.
        if (goingVertical && remX != 0) {
            if (wasHorizontal) {
                this.direction = tempDirection;
            } else {
                this.direction =
                    remX < oneBlockSize / 2
                        ? DIRECTION_LEFT
                        : DIRECTION_RIGHT;
            }
        }
        if (goingHorizontal && remY != 0) {
            if (wasVertical) {
                this.direction = tempDirection;
            } else {
                this.direction =
                    remY < oneBlockSize / 2
                        ? DIRECTION_UP
                        : DIRECTION_BOTTOM;
            }
        }

        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    calculateNewDirection(map, destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];
        mp[this.getMapY()][this.getMapX()] = 1;

        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x == destX && poped.y == destY) {
                return poped.moves[0];
            }
            let neighborList = this.addNeighbors(poped, mp);
            for (let i = 0; i < neighborList.length; i++) {
                queue.push(neighborList[i]);
            }
        }

        return undefined; // direction
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (
            poped.x - 1 >= 0 &&
            poped.x - 1 < numOfColumns &&
            mp[poped.y][poped.x - 1] != 1
        ) {
            mp[poped.y][poped.x - 1] = 1;
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.x + 1 >= 0 &&
            poped.x + 1 < numOfColumns &&
            mp[poped.y][poped.x + 1] != 1
        ) {
            mp[poped.y][poped.x + 1] = 1;
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.y - 1 >= 0 &&
            poped.y - 1 < numOfRows &&
            mp[poped.y - 1][poped.x] != 1
        ) {
            mp[poped.y - 1][poped.x] = 1;
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (
            poped.y + 1 >= 0 &&
            poped.y + 1 < numOfRows &&
            mp[poped.y + 1][poped.x] != 1
        ) {
            mp[poped.y + 1][poped.x] = 1;
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
    }

    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    drawFrightened() {
        let blinking = frightenedUntil - Date.now() < 2000;
        let flash = blinking && Math.floor(Date.now() / 200) % 2 == 0;
        let color = flash ? "white" : "#2121DE";
        let radius = this.width / 2;
        let centerX = this.x + this.width / 2;
        let centerY = this.y + this.height / 2;

        canvasContext.save();
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        canvasContext.arc(centerX, centerY, radius, Math.PI, 0);
        canvasContext.lineTo(this.x + this.width, this.y + this.height);
        canvasContext.lineTo(this.x, this.y + this.height);
        canvasContext.closePath();
        canvasContext.fill();

        canvasContext.fillStyle = color == "white" ? "#2121DE" : "white";
        canvasContext.beginPath();
        canvasContext.arc(
            this.x + this.width * 0.35,
            this.y + this.height * 0.45,
            this.width * 0.12,
            0,
            2 * Math.PI
        );
        canvasContext.fill();
        canvasContext.beginPath();
        canvasContext.arc(
            this.x + this.width * 0.65,
            this.y + this.height * 0.45,
            this.width * 0.12,
            0,
            2 * Math.PI
        );
        canvasContext.fill();
        canvasContext.restore();
    }

    draw() {
        if (this.isEaten) {
            return;
        }
        if (this.isFrightened()) {
            this.drawFrightened();
            return;
        }
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}

let ghostSpeedCandidates = null;

let snapGhostSpeed = (desired) => {
    if (desired <= 0) {
        return desired;
    }
    if (ghostSpeedCandidates == null) {
        ghostSpeedCandidates = [];
        for (let steps = 1; steps <= oneBlockSize * 4; steps++) {
            if ((oneBlockSize * 4) % steps === 0) {
                ghostSpeedCandidates.push(oneBlockSize / steps);
            }
        }
    }
    let best = desired;
    let bestError = Infinity;
    for (let i = 0; i < ghostSpeedCandidates.length; i++) {
        let speed = ghostSpeedCandidates[i];
        let error = Math.abs(speed - desired);
        if (error < bestError) {
            bestError = error;
            best = speed;
        }
    }
    return best;
};

let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        let ghost = ghosts[i];
        if (ghost.type == 0 && !ghost.isEaten) {
            let desired =
                foodLeft <= Math.floor(initialFoodCount * 0.4)
                    ? snapGhostSpeed(pacman.speed * 0.75)
                    : snapGhostSpeed(pacman.speed / 2);
            if (desired != ghost.speed && ghost.isAlignedToGrid()) {
                ghost.speed = desired;
            }
        }
        ghost.updateRespawn();
        ghost.moveProcess();
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};