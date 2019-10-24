import pygame
import numpy as np

BOARD_SIZE = 16

def gen_blocks():
    shift = [False] * BOARD_SIZE
    for x in np.random.choice(int(BOARD_SIZE), 4, replace=False):
        shift[x] = True
    return shift

pygame.init()
screen = pygame.display.set_mode((800, 600))
done = False
clock = pygame.time.Clock()
pygame.font.init()
myfont = pygame.font.SysFont('arial', 30)
pygame.key.set_repeat(100)

while not done:
    board = [False] * BOARD_SIZE
    shift = [False] * BOARD_SIZE
    reserve = [gen_blocks() for _ in range(int(BOARD_SIZE / 4)-1)]
    timer = 0.0
    game_over = False
    score = 0
    next_game = False
    while not done and not next_game:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                done = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and game_over:
                    next_game = True
                if not game_over:
                    if event.key == pygame.K_DOWN:
                        ns = reserve.pop(0)
                        reserve.append(shift)
                        shift = ns
                    if event.key == pygame.K_UP:
                        ns = reserve.pop()
                        reserve.insert(0, shift)
                        shift = ns
                    if event.key == pygame.K_LEFT:
                        shift = shift[1:] + [shift[0]]
                    if event.key == pygame.K_RIGHT:
                        shift = [shift[-1]] + shift[:-1]
                    if event.key == pygame.K_SPACE:
                        timer = 0.0
        pressed = pygame.key.get_pressed()
        if pressed[pygame.K_q]: done = True
        screen.fill((0, 0, 0))
        if timer > 0 and not game_over:
            timer -= (0.0001 + 0.00005 * score)
        pygame.draw.rect(
                screen,
                (50, 50, 50),
                (70, 480, 655,10))
        pygame.draw.rect(
                screen,
                (timer * 255, 255, 0),
                (70, 480, 660 * timer,10))
        if timer <= 0:
            for x in range(len(board)):
                if shift[x] and board[x]:
                    game_over = True
                board[x] |= shift[x]
            shift = reserve.pop(0)
            reserve.append(gen_blocks())
            solid_count = 0
            for i in board:
                if not i:
                    break
                solid_count += 1
            if solid_count >=4:
                board = board[solid_count:] + [False] * solid_count
                score += solid_count

            timer = 1.0
        for y, r in enumerate(reserve):
            for x, s in enumerate(r):
                pygame.draw.rect(
                        screen,
                        (timer * 200 if s else 80, 200 if s else 80, 80),
                        pygame.Rect(70 + x * 41 + 5, 430 - (y + 1) * 41, 30, 30))
        pygame.draw.rect(
                screen,
                (50, 200, 50),
                (67, 428, 42 * 4, 42))
        for x, state in enumerate(board):
            pygame.draw.rect(
                    screen,
                    (50, 50, 255 if state else 50),
                    pygame.Rect(70 + x * 41 + 1, 430, 38, 38))
        for x, state in enumerate(shift):
            if not state:
                continue
            pygame.draw.rect(
                    screen,
                    ((1.0 if board[x] else timer) * 255 if state else 50,
                        255 if not board[x] else 50,
                        50),
                    pygame.Rect(70 + x * 41 + 5, 434, 30, 30))
        if game_over:
            pygame.draw.rect(
                    screen,
                    (128, 10, 10),
                    pygame.Rect(0, 100, 800, 100))
            textsurface = myfont.render("GAME OVER", False, (255, 255, 255))
            screen.blit(textsurface, (300,130))

        textsurface = myfont.render("Score: %d" % score, False, (255, 255, 255))
        screen.blit(textsurface, (0,0))
        pygame.display.flip()
        clock.tick(60)
