import BattleScene, { STARTER_FORM_OVERRIDE, STARTER_SPECIES_OVERRIDE, bypassLogin, startingWave } from "./battle-scene";
import { default as Pokemon, PlayerPokemon, EnemyPokemon, PokemonMove, MoveResult, DamageResult, FieldPosition, HitResult, TurnMove } from "./field/pokemon";
import * as Utils from './utils';
import { Moves } from "./data/enums/moves";
import { allMoves, applyMoveAttrs, BypassSleepAttr, ChargeAttr, applyFilteredMoveAttrs, HitsTagAttr, MissEffectAttr, MoveAttr, MoveEffectAttr, MoveFlags, MultiHitAttr, OverrideMoveEffectAttr, VariableAccuracyAttr, MoveTarget, OneHitKOAttr, getMoveTargets, MoveTargetSet, MoveEffectTrigger, CopyMoveAttr, AttackMove, SelfStatusMove, DelayedAttackAttr, RechargeAttr, PreMoveMessageAttr, HealStatusEffectAttr, IgnoreOpponentStatChangesAttr, NoEffectAttr, FixedDamageAttr } from "./data/move";
import { Mode } from './ui/ui';
import { Command } from "./ui/command-ui-handler";
import { Stat } from "./data/pokemon-stat";
import { BerryModifier, ContactHeldItemTransferChanceModifier, EnemyAttackStatusEffectChanceModifier, EnemyPersistentModifier, EnemyStatusEffectHealChanceModifier, EnemyTurnHealModifier, ExpBalanceModifier, ExpBoosterModifier, ExpShareModifier, ExtraModifierModifier, FlinchChanceModifier, FusePokemonModifier, HealingBoosterModifier, HitHealModifier, LapsingPersistentModifier, MapModifier, Modifier, MultipleParticipantExpBonusModifier, PersistentModifier, PokemonExpBoosterModifier, PokemonHeldItemModifier, PokemonInstantReviveModifier, SwitchEffectTransferModifier, TempBattleStatBoosterModifier, TurnHealModifier, TurnHeldItemTransferModifier, MoneyMultiplierModifier, MoneyInterestModifier, IvScannerModifier, PokemonFriendshipBoosterModifier, LapsingPokemonHeldItemModifier, PokemonMultiHitModifier } from "./modifier/modifier";
import PartyUiHandler, { PartyOption, PartyUiMode } from "./ui/party-ui-handler";
import { doPokeballBounceAnim, getPokeballAtlasKey, getPokeballCatchMultiplier, getPokeballTintColor, PokeballType } from "./data/pokeball";
import { CommonAnim, CommonBattleAnim, MoveAnim, initMoveAnim, loadMoveAnimAssets } from "./data/battle-anims";
import { StatusEffect, getStatusEffectActivationText, getStatusEffectCatchRateMultiplier, getStatusEffectHealText, getStatusEffectObtainText, getStatusEffectOverlapText } from "./data/status-effect";
import { SummaryUiMode } from "./ui/summary-ui-handler";
import EvolutionSceneHandler from "./ui/evolution-scene-handler";
import { EvolutionPhase } from "./evolution-phase";
import { Phase } from "./phase";
import { BattleStat, getBattleStatLevelChangeDescription, getBattleStatName } from "./data/battle-stat";
import { biomeLinks } from "./data/biomes";
import { Biome } from "./data/enums/biome";
import { ModifierTier } from "./modifier/modifier-tier";
import { FusePokemonModifierType, ModifierPoolType, ModifierType, ModifierTypeFunc, ModifierTypeOption, PokemonModifierType, PokemonMoveModifierType, RememberMoveModifierType, TmModifierType, getDailyRunStarterModifiers, getEnemyBuffModifierForWave, getModifierType, getPlayerModifierTypeOptions, getPlayerShopModifierTypeOptionsForWave, modifierTypes, regenerateModifierPoolThresholds } from "./modifier/modifier-type";
import SoundFade from "phaser3-rex-plugins/plugins/soundfade";
import { BattlerTagLapseType, EncoreTag, HideSpriteTag as HiddenTag, ProtectedTag, TrappedTag } from "./data/battler-tags";
import { BattlerTagType } from "./data/enums/battler-tag-type";
import { getPokemonMessage } from "./messages";
import { Starter } from "./ui/starter-select-ui-handler";
import { Gender } from "./data/gender";
import { Weather, WeatherType, getRandomWeatherType, getTerrainBlockMessage, getWeatherDamageMessage, getWeatherLapseMessage } from "./data/weather";
import { TempBattleStat } from "./data/temp-battle-stat";
import { ArenaTagSide, ArenaTrapTag, MistTag, TrickRoomTag } from "./data/arena-tag";
import { ArenaTagType } from "./data/enums/arena-tag-type";
import { CheckTrappedAbAttr, MoveAbilityBypassAbAttr, IgnoreOpponentStatChangesAbAttr, PostAttackAbAttr, PostBattleAbAttr, PostDefendAbAttr, PostSummonAbAttr, PostTurnAbAttr, PostWeatherLapseAbAttr, PreSwitchOutAbAttr, PreWeatherDamageAbAttr, ProtectStatAbAttr, RedirectMoveAbAttr, RunSuccessAbAttr, StatChangeMultiplierAbAttr, SuppressWeatherEffectAbAttr, SyncEncounterNatureAbAttr, applyAbAttrs, applyCheckTrappedAbAttrs, applyPostAttackAbAttrs, applyPostBattleAbAttrs, applyPostDefendAbAttrs, applyPostSummonAbAttrs, applyPostTurnAbAttrs, applyPostWeatherLapseAbAttrs, applyPreStatChangeAbAttrs, applyPreSwitchOutAbAttrs, applyPreWeatherEffectAbAttrs, BattleStatMultiplierAbAttr, applyBattleStatMultiplierAbAttrs, IncrementMovePriorityAbAttr, applyPostVictoryAbAttrs, PostVictoryAbAttr, applyPostBattleInitAbAttrs, PostBattleInitAbAttr, BlockNonDirectDamageAbAttr as BlockNonDirectDamageAbAttr, applyPostKnockOutAbAttrs, PostKnockOutAbAttr, PostBiomeChangeAbAttr, applyPostFaintAbAttrs, PostFaintAbAttr, IncreasePpAbAttr, PostStatChangeAbAttr, applyPostStatChangeAbAttrs } from "./data/ability";
import { Abilities } from "./data/enums/abilities";
import { Unlockables, getUnlockableName } from "./system/unlockables";
import { getBiomeKey } from "./field/arena";
import { BattleType, BattlerIndex, TurnCommand } from "./battle";
import { BattleSpec } from "./enums/battle-spec";
import { Species } from "./data/enums/species";
import { HealAchv, LevelAchv, MoneyAchv, achvs } from "./system/achv";
import { TrainerSlot, trainerConfigs } from "./data/trainer-config";
import { TrainerType } from "./data/enums/trainer-type";
import { EggHatchPhase } from "./egg-hatch-phase";
import { Egg } from "./data/egg";
import { vouchers } from "./system/voucher";
import { loggedInUser, updateUserInfo } from "./account";
import { DexAttr, GameDataType, PlayerGender, SessionSaveData } from "./system/game-data";
import { addPokeballCaptureStars, addPokeballOpenParticles } from "./field/anims";
import { SpeciesFormChangeActiveTrigger, SpeciesFormChangeManualTrigger, SpeciesFormChangeMoveLearnedTrigger, SpeciesFormChangePostMoveTrigger, SpeciesFormChangePreMoveTrigger } from "./data/pokemon-forms";
import { battleSpecDialogue, getCharVariantFromDialogue } from "./data/dialogue";
import ModifierSelectUiHandler, { SHOP_OPTIONS_ROW_LIMIT } from "./ui/modifier-select-ui-handler";
import { Setting } from "./system/settings";
import { Tutorial, handleTutorial } from "./tutorial";
import { TerrainType } from "./data/terrain";
import { OptionSelectConfig, OptionSelectItem } from "./ui/abstact-option-select-ui-handler";
import { SaveSlotUiMode } from "./ui/save-slot-select-ui-handler";
import { fetchDailyRunSeed, getDailyRunStarters } from "./data/daily-run";
import { GameModes, gameModes } from "./game-mode";
import { getPokemonSpecies, speciesStarters } from "./data/pokemon-species";
import i18next from './plugins/i18n';

export class LoginPhase extends Phase {
  private showText: boolean;

  constructor(scene: BattleScene, showText?: boolean) {
    super(scene);

    this.showText = showText === undefined || !!showText;
  }

  start(): void {
    super.start();

    const hasSession = !!Utils.getCookie(Utils.sessionIdKey);

    this.scene.ui.setMode(Mode.LOADING, { buttonActions: [] });
    Utils.executeIf(bypassLogin || hasSession, updateUserInfo).then(response => {
      const success = response ? response[0] : false;
      const statusCode = response ? response[1] : null;
      if (!success) {
        if (!statusCode || statusCode === 400) {
          if (this.showText)
            this.scene.ui.showText(i18next.t('menu:logInOrCreateAccount'));
    
          this.scene.playSound('menu_open');

          const loadData = () => {
            updateUserInfo().then(() => this.scene.gameData.loadSystem().then(() => this.end()));
          };
      
          this.scene.ui.setMode(Mode.LOGIN_FORM, {
            buttonActions: [
              () => {
                this.scene.ui.playSelect();
                loadData();
              }, () => {
                this.scene.playSound('menu_open');
                this.scene.ui.setMode(Mode.REGISTRATION_FORM, {
                  buttonActions: [
                    () => {
                      this.scene.ui.playSelect();
                      updateUserInfo().then(() => this.end());
                    }, () => {
                      this.scene.unshiftPhase(new LoginPhase(this.scene, false));
                      this.end();
                    }
                  ]
                });
              }
            ]
          });
        } else {
          this.scene.unshiftPhase(new UnavailablePhase(this.scene));
          super.end();
        }
        return null;
      } else {
        this.scene.gameData.loadSystem().then(success => {
          if (success || bypassLogin)
            this.end();
          else {
            this.scene.ui.setMode(Mode.MESSAGE);
            this.scene.ui.showText(i18next.t('menu:failedToLoadSaveData'));
          }
        });
      }
    });
  }

  end(): void {
    this.scene.ui.setMode(Mode.MESSAGE);

    if (!this.scene.gameData.gender)
      this.scene.unshiftPhase(new SelectGenderPhase(this.scene));
    
    handleTutorial(this.scene, Tutorial.Intro).then(() => super.end());
  }
}

export class TitlePhase extends Phase {
  private loaded: boolean;
  private lastSessionData: SessionSaveData;
  private gameMode: GameModes;

  constructor(scene: BattleScene) {
    super(scene);

    this.loaded = false;
  }

  start(): void {
    super.start();

    this.scene.ui.clearText();
    this.scene.ui.fadeIn(250);

    this.scene.playBgm('title', true);

    this.scene.gameData.getSession(loggedInUser.lastSessionSlot).then(sessionData => {
      if (sessionData) {
        this.lastSessionData = sessionData;
        const biomeKey = getBiomeKey(sessionData.arena.biome);
        const bgTexture = `${biomeKey}_bg`;
        this.scene.arenaBg.setTexture(bgTexture);
      }
      this.showOptions();
    }).catch(err => {
      console.error(err);
      this.showOptions();
    });
  }

  showOptions(): void {
    const options: OptionSelectItem[] = [];
    if (loggedInUser.lastSessionSlot > -1) {
      options.push({
        label: i18next.t('menu:continue'),
        handler: () => {
          this.loadSaveSlot(this.lastSessionData ? -1 : loggedInUser.lastSessionSlot);
          return true;
        }
      });
    }
    options.push({
      label: i18next.t('menu:newGame'),
      handler: () => {
        const setModeAndEnd = (gameMode: GameModes) => {
          this.gameMode = gameMode;
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.clearText();
          this.end();
        };
        if (this.scene.gameData.unlocks[Unlockables.ENDLESS_MODE]) {
          const options: OptionSelectItem[] = [
            {
              label: gameModes[GameModes.CLASSIC].getName(),
              handler: () => {
                setModeAndEnd(GameModes.CLASSIC);
                return true;
              }
            },
            {
              label: gameModes[GameModes.ENDLESS].getName(),
              handler: () => {
                setModeAndEnd(GameModes.ENDLESS);
                return true;
              }
            }
          ];
          if (this.scene.gameData.unlocks[Unlockables.SPLICED_ENDLESS_MODE]) {
            options.push({
              label: gameModes[GameModes.SPLICED_ENDLESS].getName(),
              handler: () => {
                setModeAndEnd(GameModes.SPLICED_ENDLESS);
                return true;
              }
            });
          }
          options.push({
            label: i18next.t('menu:cancel'),
            handler: () => {
              this.scene.clearPhaseQueue();
              this.scene.pushPhase(new TitlePhase(this.scene));
              super.end();
              return true;
            }
          });
          this.scene.ui.showText(i18next.t("menu:selectGameMode"), null, () => this.scene.ui.setOverlayMode(Mode.OPTION_SELECT, { options: options }));
        } else {
          this.gameMode = GameModes.CLASSIC;
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.clearText();
          this.end();
        }
        return true;
      }
    },
    {
      label: i18next.t('menu:loadGame'),
      handler: () => {
        this.scene.ui.setOverlayMode(Mode.SAVE_SLOT, SaveSlotUiMode.LOAD,
          (slotId: integer) => {
            if (slotId === -1)
              return this.showOptions();
            this.loadSaveSlot(slotId);
          });
        return true;
      }
    },
    {
      label: i18next.t('menu:dailyRun'),
      handler: () => {
        this.initDailyRun();
        return true;
      },
      keepOpen: true
    });
    const config: OptionSelectConfig = {
      options: options,
      noCancel: true,
      yOffset: 47
    };
    this.scene.ui.setMode(Mode.TITLE, config);
  }

  loadSaveSlot(slotId: integer): void {
    this.scene.sessionSlotId = slotId > -1 ? slotId : loggedInUser.lastSessionSlot;
    this.scene.ui.setMode(Mode.MESSAGE);
    this.scene.gameData.loadSession(this.scene, slotId, slotId === -1 ? this.lastSessionData : null).then((success: boolean) => {
      if (success) {
        this.loaded = true;
        this.scene.ui.showText(i18next.t('menu:sessionSuccess'), null, () => this.end());
      } else
        this.end();
    }).catch(err => {
      console.error(err);
      this.scene.ui.showText(i18next.t('menu:failedToLoadSession'), null);
    });
  }

  initDailyRun(): void {
    this.scene.ui.setMode(Mode.SAVE_SLOT, SaveSlotUiMode.SAVE, (slotId: integer) => {
      this.scene.clearPhaseQueue();
      if (slotId === -1) {
        this.scene.pushPhase(new TitlePhase(this.scene));
        return super.end();
      }
      this.scene.sessionSlotId = slotId;

      fetchDailyRunSeed().then(seed => {
        this.scene.gameMode = gameModes[GameModes.DAILY];

        this.scene.setSeed(seed);
        this.scene.resetSeed(1);

        this.scene.money = this.scene.gameMode.getStartingMoney();

        const starters = getDailyRunStarters(this.scene, seed);
        const startingLevel = this.scene.gameMode.getStartingLevel();

        const party = this.scene.getParty();
        const loadPokemonAssets: Promise<void>[] = [];
        for (let starter of starters) {
          const starterProps = this.scene.gameData.getSpeciesDexAttrProps(starter.species, starter.dexAttr);
          const starterFormIndex = Math.min(starterProps.formIndex, Math.max(starter.species.forms.length - 1, 0));
          const starterGender = starter.species.malePercent !== null
            ? !starterProps.female ? Gender.MALE : Gender.FEMALE
            : Gender.GENDERLESS;
          const starterPokemon = this.scene.addPlayerPokemon(starter.species, startingLevel, starterProps.abilityIndex, starterFormIndex, starterGender, starterProps.shiny, undefined, starter.nature);
          starterPokemon.setVisible(false);
          party.push(starterPokemon);
          loadPokemonAssets.push(starterPokemon.loadAssets());
        }
        
        regenerateModifierPoolThresholds(party, ModifierPoolType.DAILY_STARTER);
        const modifiers: Modifier[] = Array(3).fill(null).map(() => modifierTypes.EXP_SHARE().withIdFromFunc(modifierTypes.EXP_SHARE).newModifier())
          .concat(Array(3).fill(null).map(() => modifierTypes.GOLDEN_EXP_CHARM().withIdFromFunc(modifierTypes.GOLDEN_EXP_CHARM).newModifier()))
          .concat(getDailyRunStarterModifiers(party));

        for (let m of modifiers)
          this.scene.addModifier(m, true, false, false, true);
        this.scene.updateModifiers(true, true);

        Promise.all(loadPokemonAssets).then(() => {
          this.scene.time.delayedCall(500, () => this.scene.playBgm());
          this.scene.gameData.gameStats.dailyRunSessionsPlayed++;
          this.scene.newArena(this.scene.gameMode.getStartingBiome(this.scene));
          this.scene.newBattle();
          this.scene.arena.init();
          this.scene.sessionPlayTime = 0;
          this.end();
        });
      });
    });
  }

  end(): void {
    if (!this.loaded && !this.scene.gameMode.isDaily) {
      this.scene.arena.preloadBgm();
      this.scene.pushPhase(new SelectStarterPhase(this.scene, this.gameMode));
      this.scene.newArena(this.scene.gameMode.getStartingBiome(this.scene));
    } else
      this.scene.playBgm();

    this.scene.pushPhase(new EncounterPhase(this.scene, this.loaded));

    if (this.loaded) {
      const availablePartyMembers = this.scene.getParty().filter(p => !p.isFainted()).length;

      this.scene.pushPhase(new SummonPhase(this.scene, 0, true, true));
      if (this.scene.currentBattle.double && availablePartyMembers > 1)
        this.scene.pushPhase(new SummonPhase(this.scene, 1, true, true));
      if (this.scene.currentBattle.waveIndex > 1 && this.scene.currentBattle.battleType !== BattleType.TRAINER) {
        this.scene.pushPhase(new CheckSwitchPhase(this.scene, 0, this.scene.currentBattle.double));
        if (this.scene.currentBattle.double && availablePartyMembers > 1)
          this.scene.pushPhase(new CheckSwitchPhase(this.scene, 1, this.scene.currentBattle.double));
      }
    }

    for (let achv of Object.keys(this.scene.gameData.achvUnlocks)) {
      if (vouchers.hasOwnProperty(achv))
        this.scene.validateVoucher(vouchers[achv]);
    }

    super.end();
  }
}

export class UnavailablePhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    this.scene.ui.setMode(Mode.UNAVAILABLE, () => {
      this.scene.unshiftPhase(new LoginPhase(this.scene, true));
      this.end();
    });
  }
}

export class OutdatedPhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    this.scene.ui.setMode(Mode.OUTDATED);
  }
}

export class SelectGenderPhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }
  
  start(): void {
    super.start();

    this.scene.ui.showText(i18next.t('menu:boyOrGirl'), null, () => {
      this.scene.ui.setMode(Mode.OPTION_SELECT, {
        options: [
          {
            label: i18next.t('menu:boy'),
            handler: () => {
              this.scene.gameData.gender = PlayerGender.MALE;
              this.scene.gameData.saveSetting(Setting.Player_Gender, 0);
              this.scene.gameData.saveSystem().then(() => this.end());
              return true;
            }
          },
          {
            label: i18next.t('menu:girl'),
            handler: () => {
              this.scene.gameData.gender = PlayerGender.FEMALE;
              this.scene.gameData.saveSetting(Setting.Player_Gender, 1);
              this.scene.gameData.saveSystem().then(() => this.end());
              return true;
            }
          }
        ]
      });
    });
  }

  end(): void {
    this.scene.ui.setMode(Mode.MESSAGE);
    super.end();
  }
}

export class SelectStarterPhase extends Phase {
  private gameMode: GameModes;

  constructor(scene: BattleScene, gameMode: GameModes) {
    super(scene);

    this.gameMode = gameMode;
  }

  start() {
    super.start();

    this.scene.playBgm('menu');

    this.scene.ui.setMode(Mode.STARTER_SELECT, (starters: Starter[]) => {
      this.scene.ui.clearText();
      this.scene.ui.setMode(Mode.SAVE_SLOT, SaveSlotUiMode.SAVE, (slotId: integer) => {
        if (slotId === -1) {
          this.scene.clearPhaseQueue();
          this.scene.pushPhase(new TitlePhase(this.scene));
          return this.end();
        }
        this.scene.sessionSlotId = slotId;

        const party = this.scene.getParty();
        const loadPokemonAssets: Promise<void>[] = [];
        starters.forEach((starter: Starter, i: integer) => {
          if (!i && STARTER_SPECIES_OVERRIDE)
            starter.species = getPokemonSpecies(STARTER_SPECIES_OVERRIDE as Species);
          const starterProps = this.scene.gameData.getSpeciesDexAttrProps(starter.species, starter.dexAttr);
          let starterFormIndex = Math.min(starterProps.formIndex, Math.max(starter.species.forms.length - 1, 0));
          if (!i && STARTER_SPECIES_OVERRIDE)
            starterFormIndex = STARTER_FORM_OVERRIDE;
          const starterGender = starter.species.malePercent !== null
            ? !starterProps.female ? Gender.MALE : Gender.FEMALE
            : Gender.GENDERLESS;
          const starterIvs = this.scene.gameData.dexData[starter.species.speciesId].ivs.slice(0);
          const starterPokemon = this.scene.addPlayerPokemon(starter.species, this.scene.gameMode.getStartingLevel(), starterProps.abilityIndex, starterFormIndex, starterGender, starterProps.shiny, starterIvs, starter.nature);
          starterPokemon.tryPopulateMoveset(starter.moveset);
          if (starter.passive)
            starterPokemon.passive = true;
          if (starter.variant && starter.dexAttr & DexAttr.SHINY)
            starterPokemon.variant = starter.variant;
          if (starter.pokerus)
            starterPokemon.pokerus = true;
          if (this.scene.gameMode.isSplicedOnly)
            starterPokemon.generateFusionSpecies(true);
          starterPokemon.setVisible(false);
          party.push(starterPokemon);
          loadPokemonAssets.push(starterPokemon.loadAssets());
        });
        Promise.all(loadPokemonAssets).then(() => {
          SoundFade.fadeOut(this.scene, this.scene.sound.get('menu'), 500, true);
          this.scene.time.delayedCall(500, () => this.scene.playBgm());
          if (this.scene.gameMode.isClassic)
            this.scene.gameData.gameStats.classicSessionsPlayed++;
          else
            this.scene.gameData.gameStats.endlessSessionsPlayed++;
          this.scene.newBattle();
          this.scene.arena.init();
          this.scene.sessionPlayTime = 0;
          this.end();
        });
      });
    }, this.gameMode);
  }
}

export class BattlePhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  showEnemyTrainer(trainerSlot: TrainerSlot = TrainerSlot.NONE): void {
    const sprites = this.scene.currentBattle.trainer.getSprites();
    const tintSprites = this.scene.currentBattle.trainer.getTintSprites();
    for (let i = 0; i < sprites.length; i++) {
      const visible = !trainerSlot || !i === (trainerSlot === TrainerSlot.TRAINER) || sprites.length < 2;
      [ sprites[i], tintSprites[i] ].map(sprite => {
        if (visible)
          sprite.x = trainerSlot || sprites.length < 2 ? 0 : i ? 16 : -16;
        sprite.setVisible(visible);
        sprite.clearTint();
      })
      sprites[i].setVisible(visible);
      tintSprites[i].setVisible(visible);
      sprites[i].clearTint();
      tintSprites[i].clearTint();
    }
    this.scene.tweens.add({
      targets: this.scene.currentBattle.trainer,
      x: '-=16',
      y: '+=16',
      alpha: 1,
      ease: 'Sine.easeInOut',
      duration: 750
    });
  }

  hideEnemyTrainer(): void {
    this.scene.tweens.add({
      targets: this.scene.currentBattle.trainer,
      x: '+=16',
      y: '-=16',
      alpha: 0,
      ease: 'Sine.easeInOut',
      duration: 750
    });
  }
}

type PokemonFunc = (pokemon: Pokemon) => void;

export abstract class FieldPhase extends BattlePhase {
  getOrder(): BattlerIndex[] {
    const playerField = this.scene.getPlayerField().filter(p => p.isActive()) as Pokemon[];
    const enemyField = this.scene.getEnemyField().filter(p => p.isActive()) as Pokemon[];

    let orderedTargets: Pokemon[] = playerField.concat(enemyField).sort((a: Pokemon, b: Pokemon) => {
      const aSpeed = a?.getBattleStat(Stat.SPD) || 0;
      const bSpeed = b?.getBattleStat(Stat.SPD) || 0;

      return aSpeed < bSpeed ? 1 : aSpeed > bSpeed ? -1 : !this.scene.randBattleSeedInt(2) ? -1 : 1;
    });

    const speedReversed = new Utils.BooleanHolder(false);
    this.scene.arena.applyTags(TrickRoomTag, speedReversed);

    if (speedReversed.value)
      orderedTargets = orderedTargets.reverse();

    return orderedTargets.map(t => t.getFieldIndex() + (!t.isPlayer() ? BattlerIndex.ENEMY : 0));
  }

  executeForAll(func: PokemonFunc): void {
    const field = this.scene.getField(true).filter(p => p.summonData);
    field.forEach(pokemon => func(pokemon));
  }
}

export abstract class PokemonPhase extends FieldPhase {
  protected battlerIndex: BattlerIndex | integer;
  public player: boolean;
  public fieldIndex: integer;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex | integer) {
    super(scene);

    if (battlerIndex === undefined)
      battlerIndex = scene.getField().find(p => p?.isActive()).getBattlerIndex();

    this.battlerIndex = battlerIndex;
    this.player = battlerIndex < 2;
    this.fieldIndex = battlerIndex % 2;
  }

  getPokemon() {
    if (this.battlerIndex > BattlerIndex.ENEMY_2)
      return this.scene.getPokemonById(this.battlerIndex);
    return this.scene.getField()[this.battlerIndex];
  }
}

export abstract class PartyMemberPokemonPhase extends FieldPhase {
  protected partyMemberIndex: integer;
  protected fieldIndex: integer;
  protected player: boolean;

  constructor(scene: BattleScene, partyMemberIndex: integer, player: boolean) {
    super(scene);

    this.partyMemberIndex = partyMemberIndex;
    this.fieldIndex = partyMemberIndex < this.scene.currentBattle.getBattlerCount()
      ? partyMemberIndex
      : -1;
    this.player = player;
  }

  getParty(): Pokemon[] {
    return this.player ? this.scene.getParty() : this.scene.getEnemyParty();
  }

  getPokemon(): Pokemon {
    return this.getParty()[this.partyMemberIndex];
  }
}

export abstract class PlayerPartyMemberPokemonPhase extends PartyMemberPokemonPhase {
  constructor(scene: BattleScene, partyMemberIndex: integer) {
    super(scene, partyMemberIndex, true);
  }

  getPlayerPokemon(): PlayerPokemon {
    return super.getPokemon() as PlayerPokemon;
  }
}

export abstract class EnemyPartyMemberPokemonPhase extends PartyMemberPokemonPhase {
  constructor(scene: BattleScene, partyMemberIndex: integer) {
    super(scene, partyMemberIndex, false);
  }

  getEnemyPokemon(): EnemyPokemon {
    return super.getPokemon() as EnemyPokemon;
  }
}

export class EncounterPhase extends BattlePhase {
  private loaded: boolean;

  constructor(scene: BattleScene, loaded?: boolean) {
    super(scene);

    this.loaded = !!loaded;
  }

  start() {
    super.start();

    this.scene.initSession();

    const loadEnemyAssets = [];

    const battle = this.scene.currentBattle;

    let totalBst = 0;

    battle.enemyLevels.forEach((level, e) => {
      if (!this.loaded) {
        if (battle.battleType === BattleType.TRAINER)
          battle.enemyParty[e] = battle.trainer.genPartyMember(e);
        else {
          const enemySpecies = this.scene.randomSpecies(battle.waveIndex, level, true);
          battle.enemyParty[e] = this.scene.addEnemyPokemon(enemySpecies, level, TrainerSlot.NONE, !!this.scene.getEncounterBossSegments(battle.waveIndex, level, enemySpecies));
          if (this.scene.currentBattle.battleSpec === BattleSpec.FINAL_BOSS)
            battle.enemyParty[e].ivs = new Array(6).fill(31);
          this.scene.getParty().slice(0, !battle.double ? 1 : 2).reverse().forEach(playerPokemon => {
            applyAbAttrs(SyncEncounterNatureAbAttr, playerPokemon, null, battle.enemyParty[e]);
          });
        }
      }
      const enemyPokemon = this.scene.getEnemyParty()[e];
      if (e < (battle.double ? 2 : 1)) {
        enemyPokemon.setX(-66 + enemyPokemon.getFieldPositionOffset()[0]);
        enemyPokemon.resetSummonData();
      }

      if (!this.loaded)
        this.scene.gameData.setPokemonSeen(enemyPokemon);

      if (enemyPokemon.species.speciesId === Species.ETERNATUS) {
        if (this.scene.gameMode.isClassic && (battle.battleSpec === BattleSpec.FINAL_BOSS || this.scene.gameMode.isWaveFinal(battle.waveIndex))) {
          if (battle.battleSpec !== BattleSpec.FINAL_BOSS) {
            enemyPokemon.formIndex = 1;
            enemyPokemon.updateScale();
          }
          enemyPokemon.setBoss();
        } else if (!(battle.waveIndex % 1000)) {
          enemyPokemon.formIndex = 1;
          enemyPokemon.updateScale();
        }
      }
      
      totalBst += enemyPokemon.getSpeciesForm().baseTotal;

      loadEnemyAssets.push(enemyPokemon.loadAssets());
  
      console.log(enemyPokemon.name, enemyPokemon.species.speciesId, enemyPokemon.stats);
    });

    if (this.scene.getParty().filter(p => p.isShiny()).length === 6)
      this.scene.validateAchv(achvs.SHINY_PARTY);

    if (battle.battleType === BattleType.TRAINER)
      loadEnemyAssets.push(battle.trainer.loadAssets().then(() => battle.trainer.initSprite()));
    else {
      if (battle.enemyParty.filter(p => p.isBoss()).length > 1) {
        for (let enemyPokemon of battle.enemyParty) {
          if (enemyPokemon.isBoss()) {
            enemyPokemon.setBoss(true, Math.ceil(enemyPokemon.bossSegments * (enemyPokemon.getSpeciesForm().baseTotal / totalBst)));
            enemyPokemon.initBattleInfo();
          }
        }
      }
    }

    Promise.all(loadEnemyAssets).then(() => {
      battle.enemyParty.forEach((enemyPokemon, e) => {
        if (e < (battle.double ? 2 : 1)) {
          if (battle.battleType === BattleType.WILD) {
            this.scene.field.add(enemyPokemon);
            battle.seenEnemyPartyMemberIds.add(enemyPokemon.id);
            const playerPokemon = this.scene.getPlayerPokemon();
            if (playerPokemon?.visible)
              this.scene.field.moveBelow(enemyPokemon as Pokemon, playerPokemon);
            enemyPokemon.tint(0, 0.5);
          } else if (battle.battleType === BattleType.TRAINER) {
            enemyPokemon.setVisible(false);
            this.scene.currentBattle.trainer.tint(0, 0.5);
          }
          if (battle.double)
            enemyPokemon.setFieldPosition(e ? FieldPosition.RIGHT : FieldPosition.LEFT);
        }
      });

      if (!this.loaded) {
        regenerateModifierPoolThresholds(this.scene.getEnemyField(), battle.battleType === BattleType.TRAINER ? ModifierPoolType.TRAINER : ModifierPoolType.WILD);
        this.scene.generateEnemyModifiers();
      }

      this.scene.ui.setMode(Mode.MESSAGE).then(() => {
        if (!this.loaded) {
          this.scene.gameData.saveSystem().then(success => {
            if (!success)
              return this.scene.reset(true);
            this.scene.gameData.saveSession(this.scene, true).then(() => this.doEncounter());
          });
        } else
          this.doEncounter();
      });
    });
  }

  doEncounter() {
    this.scene.playBgm(undefined, true);
    this.scene.updateModifiers(false);
    this.scene.setFieldScale(1);

    /*if (startingWave > 10) {
      for (let m = 0; m < Math.min(Math.floor(startingWave / 10), 99); m++)
        this.scene.addModifier(getPlayerModifierTypeOptionsForWave((m + 1) * 10, 1, this.scene.getParty())[0].type.newModifier(), true);
      this.scene.updateModifiers(true);
    }*/

    for (let pokemon of this.scene.getParty()) {
      if (pokemon)
        pokemon.resetBattleData();
    }

    this.scene.arena.trySetWeather(getRandomWeatherType(this.scene.arena), false);

    const enemyField = this.scene.getEnemyField();
    this.scene.tweens.add({
      targets: [ this.scene.arenaEnemy, this.scene.currentBattle.trainer, enemyField, this.scene.arenaPlayer, this.scene.trainer ].flat(),
      x: (_target, _key, value, fieldIndex: integer) => fieldIndex < 2 + (enemyField.length) ? value + 300 : value - 300,
      duration: 2000,
      onComplete: () => {
        if (!this.tryOverrideForBattleSpec())
          this.doEncounterCommon();
      }
    });
  }

  getEncounterMessage(): string {
    const enemyField = this.scene.getEnemyField();

    if (this.scene.currentBattle.battleSpec === BattleSpec.FINAL_BOSS)
      return i18next.t('menu:bossAppeared', {bossName: enemyField[0].name});

    if (this.scene.currentBattle.battleType === BattleType.TRAINER)
      return i18next.t('menu:trainerAppeared', {trainerName: this.scene.currentBattle.trainer.getName(TrainerSlot.NONE, true)});

    return enemyField.length === 1
      ? i18next.t('menu:singleWildAppeared', {pokemonName: enemyField[0].name})
      : i18next.t('menu:multiWildAppeared', {pokemonName1: enemyField[0].name, pokemonName2: enemyField[1].name})
  }

  doEncounterCommon(showEncounterMessage: boolean = true) {
    const enemyField = this.scene.getEnemyField();

    if (this.scene.currentBattle.battleType === BattleType.WILD) {
      enemyField.forEach(enemyPokemon => {
        enemyPokemon.untint(100, 'Sine.easeOut');
        enemyPokemon.cry();
        enemyPokemon.showInfo();
        if (enemyPokemon.isShiny())
          this.scene.validateAchv(achvs.SEE_SHINY);
      });
      this.scene.updateFieldScale();
      if (showEncounterMessage)
        this.scene.ui.showText(this.getEncounterMessage(), null, () => this.end(), 1500);
      else
        this.end();
    } else if (this.scene.currentBattle.battleType === BattleType.TRAINER) {
      const trainer = this.scene.currentBattle.trainer;
      trainer.untint(100, 'Sine.easeOut');
      trainer.playAnim();
      
      const doSummon = () => {
        this.scene.currentBattle.started = true;
        this.scene.playBgm(undefined);
        this.scene.pbTray.showPbTray(this.scene.getParty());
			  this.scene.pbTrayEnemy.showPbTray(this.scene.getEnemyParty());
        const doTrainerSummon = () => {
          this.hideEnemyTrainer();
          const availablePartyMembers = this.scene.getEnemyParty().filter(p => !p.isFainted()).length;
          this.scene.unshiftPhase(new SummonPhase(this.scene, 0, false));
          if (this.scene.currentBattle.double && availablePartyMembers > 1)
            this.scene.unshiftPhase(new SummonPhase(this.scene, 1, false));
          this.end();
        };
        if (showEncounterMessage)
          this.scene.ui.showText(this.getEncounterMessage(), null, doTrainerSummon, 1500, true);
        else
          doTrainerSummon();
      };
      
      const encounterMessages = this.scene.currentBattle.trainer.getEncounterMessages();

      if (!encounterMessages?.length)
        doSummon();
      else {
        const showDialogueAndSummon = () => {
          let message: string;
          this.scene.executeWithSeedOffset(() => message = Utils.randSeedItem(encounterMessages), this.scene.currentBattle.waveIndex);
          this.scene.ui.showDialogue(message, trainer.getName(), null, () => {
            this.scene.charSprite.hide().then(() => this.scene.hideFieldOverlay(250).then(() => doSummon()));
          });
        };
        if (this.scene.currentBattle.trainer.config.hasCharSprite)
          this.scene.showFieldOverlay(500).then(() => this.scene.charSprite.showCharacter(trainer.getKey(), getCharVariantFromDialogue(encounterMessages[0])).then(() => showDialogueAndSummon()));
        else
          showDialogueAndSummon();
      }
    }
  }

  end() {
    const enemyField = this.scene.getEnemyField();

    enemyField.forEach((enemyPokemon, e) => {
      if (enemyPokemon.isShiny())
        this.scene.unshiftPhase(new ShinySparklePhase(this.scene, BattlerIndex.ENEMY + e));
    });

    if (this.scene.currentBattle.battleType !== BattleType.TRAINER) {
      enemyField.map(p => this.scene.pushPhase(new PostSummonPhase(this.scene, p.getBattlerIndex())));
      const ivScannerModifier = this.scene.findModifier(m => m instanceof IvScannerModifier);
      if (ivScannerModifier)
        enemyField.map(p => this.scene.pushPhase(new ScanIvsPhase(this.scene, p.getBattlerIndex(), Math.min(ivScannerModifier.getStackCount() * 2, 6))));
    }

    if (!this.loaded) {
      const availablePartyMembers = this.scene.getParty().filter(p => !p.isFainted());

      if (availablePartyMembers[0].isOnField())
        applyPostBattleInitAbAttrs(PostBattleInitAbAttr, availablePartyMembers[0]);
      else
        this.scene.pushPhase(new SummonPhase(this.scene, 0));

      if (this.scene.currentBattle.double) {
        if (availablePartyMembers.length > 1) {
          this.scene.pushPhase(new ToggleDoublePositionPhase(this.scene, true));
          if (availablePartyMembers[1].isOnField())
            applyPostBattleInitAbAttrs(PostBattleInitAbAttr, availablePartyMembers[1]);
          else
            this.scene.pushPhase(new SummonPhase(this.scene, 1));
        }
      } else {
        if (availablePartyMembers.length > 1 && availablePartyMembers[1].isOnField())
          this.scene.pushPhase(new ReturnPhase(this.scene, 1));
        this.scene.pushPhase(new ToggleDoublePositionPhase(this.scene, false));
      }
     
      if (this.scene.currentBattle.waveIndex > startingWave && this.scene.currentBattle.battleType !== BattleType.TRAINER) {
        this.scene.pushPhase(new CheckSwitchPhase(this.scene, 0, this.scene.currentBattle.double));
        if (this.scene.currentBattle.double && availablePartyMembers.length > 1)
          this.scene.pushPhase(new CheckSwitchPhase(this.scene, 1, this.scene.currentBattle.double));
      }
    }

    handleTutorial(this.scene, Tutorial.Access_Menu).then(() => super.end());
  }

  tryOverrideForBattleSpec(): boolean {
    switch (this.scene.currentBattle.battleSpec) {
      case BattleSpec.FINAL_BOSS:
        const enemy = this.scene.getEnemyPokemon();
        this.scene.ui.showText(this.getEncounterMessage(), null, () => {
          this.scene.ui.showDialogue(battleSpecDialogue[BattleSpec.FINAL_BOSS].encounter, enemy.species.name, null, () => {
            this.doEncounterCommon(false);
          });
        }, 1500, true);
        return true;
    }

    return false;
  }
}

export class NextEncounterPhase extends EncounterPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  doEncounter(): void {
    this.scene.playBgm(undefined, true);

    for (let pokemon of this.scene.getParty()) {
      if (pokemon)
        pokemon.resetBattleData();
    }

    this.scene.arenaNextEnemy.setBiome(this.scene.arena.biomeType);
    this.scene.arenaNextEnemy.setVisible(true);

    const enemyField = this.scene.getEnemyField();
    this.scene.tweens.add({
      targets: [ this.scene.arenaEnemy, this.scene.arenaNextEnemy, this.scene.currentBattle.trainer, enemyField, this.scene.lastEnemyTrainer ].flat(),
      x: '+=300',
      duration: 2000,
      onComplete: () => {
        this.scene.arenaEnemy.setBiome(this.scene.arena.biomeType);
        this.scene.arenaEnemy.setX(this.scene.arenaNextEnemy.x);
        this.scene.arenaEnemy.setAlpha(1);
        this.scene.arenaNextEnemy.setX(this.scene.arenaNextEnemy.x - 300);
        this.scene.arenaNextEnemy.setVisible(false);
        if (this.scene.lastEnemyTrainer)
          this.scene.lastEnemyTrainer.destroy();
        
        if (!this.tryOverrideForBattleSpec())
          this.doEncounterCommon();
      }
    });
  }
}

export class NewBiomeEncounterPhase extends NextEncounterPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  doEncounter(): void {
    this.scene.playBgm(undefined, true);

    for (let pokemon of this.scene.getParty()) {
      if (pokemon)
        pokemon.resetBattleData();
    }

    this.scene.arena.trySetWeather(getRandomWeatherType(this.scene.arena), false);

    for (let pokemon of this.scene.getParty().filter(p => p.isOnField()))
      applyAbAttrs(PostBiomeChangeAbAttr, pokemon, null);

    const enemyField = this.scene.getEnemyField();
    this.scene.tweens.add({
      targets: [ this.scene.arenaEnemy, enemyField ].flat(),
      x: '+=300',
      duration: 2000,
      onComplete: () => {
        if (!this.tryOverrideForBattleSpec())
          this.doEncounterCommon();
      }
    });
  }
}

export class PostSummonPhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();

    this.scene.arena.applyTags(ArenaTrapTag, pokemon);
    applyPostSummonAbAttrs(PostSummonAbAttr, pokemon).then(() => this.end());
  }
}

export class SelectBiomePhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    const currentBiome = this.scene.arena.biomeType;

    const setNextBiome = (nextBiome: Biome) => {
      if (this.scene.currentBattle.waveIndex % 10 === 1) {
        this.scene.applyModifiers(MoneyInterestModifier, true, this.scene);
        this.scene.unshiftPhase(new PartyHealPhase(this.scene, false));
      }
      this.scene.unshiftPhase(new SwitchBiomePhase(this.scene, nextBiome));
      this.end();
    };

    if ((this.scene.gameMode.isClassic && this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex + 9))
      || (this.scene.gameMode.isDaily && this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex)))
      setNextBiome(Biome.END);
    else if (this.scene.gameMode.hasRandomBiomes)
      setNextBiome(this.generateNextBiome());
    else if (Array.isArray(biomeLinks[currentBiome])) {
      let biomes: Biome[];
      this.scene.executeWithSeedOffset(() => {
        biomes = (biomeLinks[currentBiome] as (Biome | [Biome, integer])[])
          .filter(b => !Array.isArray(b) || !Utils.randSeedInt(b[1]))
          .map(b => !Array.isArray(b) ? b : b[0]);
      }, this.scene.currentBattle.waveIndex);
      if (biomes.length > 1 && this.scene.findModifier(m => m instanceof MapModifier)) {
        this.scene.ui.setMode(Mode.BIOME_SELECT, currentBiome, (biomeIndex: integer) => {
          this.scene.ui.setMode(Mode.MESSAGE);
          setNextBiome(biomes[biomeIndex]);
        });
      } else
        setNextBiome(biomes[Utils.randSeedInt(biomes.length)]);
    } else
      setNextBiome(biomeLinks[currentBiome] as Biome);
  }

  generateNextBiome(): Biome {
    if (!(this.scene.currentBattle.waveIndex % 50))
      return Biome.END;
    return this.scene.generateRandomBiome(this.scene.currentBattle.waveIndex);
  }
}

export class SwitchBiomePhase extends BattlePhase {
  private nextBiome: Biome;

  constructor(scene: BattleScene, nextBiome: Biome) {
    super(scene);

    this.nextBiome = nextBiome;
  }

  start() {
    super.start();

    if (this.nextBiome === undefined)
      return this.end();

    this.scene.tweens.add({
      targets: [ this.scene.arenaEnemy, this.scene.lastEnemyTrainer ],
      x: '+=300',
      duration: 2000,
      onComplete: () => {
        this.scene.arenaEnemy.setX(this.scene.arenaEnemy.x - 600);

        this.scene.newArena(this.nextBiome);

        const biomeKey = getBiomeKey(this.nextBiome);
        const bgTexture = `${biomeKey}_bg`;
        this.scene.arenaBgTransition.setTexture(bgTexture)
        this.scene.arenaBgTransition.setAlpha(0);
        this.scene.arenaBgTransition.setVisible(true);
        this.scene.arenaPlayerTransition.setBiome(this.nextBiome);
        this.scene.arenaPlayerTransition.setAlpha(0);
        this.scene.arenaPlayerTransition.setVisible(true);

        this.scene.tweens.add({
          targets: [ this.scene.arenaPlayer, this.scene.arenaBgTransition, this.scene.arenaPlayerTransition ],
          duration: 1000,
          delay: 1000,
          ease: 'Sine.easeInOut',
          alpha: (target: any) => target === this.scene.arenaPlayer ? 0 : 1,
          onComplete: () => {
            this.scene.arenaBg.setTexture(bgTexture);
            this.scene.arenaPlayer.setBiome(this.nextBiome);
            this.scene.arenaPlayer.setAlpha(1);
            this.scene.arenaEnemy.setBiome(this.nextBiome);
            this.scene.arenaEnemy.setAlpha(1);
            this.scene.arenaNextEnemy.setBiome(this.nextBiome);
            this.scene.arenaBgTransition.setVisible(false);
            this.scene.arenaPlayerTransition.setVisible(false);
            if (this.scene.lastEnemyTrainer)
              this.scene.lastEnemyTrainer.destroy();

            this.end();
          }
        });
      }
    });
  }
}

export class SummonPhase extends PartyMemberPokemonPhase {
  private loaded: boolean;

  constructor(scene: BattleScene, fieldIndex: integer, player: boolean = true, loaded: boolean = false) {
    super(scene, fieldIndex, player);

    this.loaded = loaded;
  }

  start() {
    super.start();

    this.preSummon();
  }

  preSummon(): void {
    const partyMember = this.getPokemon();
    if (partyMember.isFainted()) {
      const party = this.getParty();
      const nonFaintedIndex = party.slice(this.partyMemberIndex).findIndex(p => !p.isFainted()) + this.partyMemberIndex;
      const nonFaintedPartyMember = party[nonFaintedIndex];
      party[nonFaintedIndex] = partyMember;
      party[this.partyMemberIndex] = nonFaintedPartyMember;
    }

    if (this.player) {
      this.scene.ui.showText(`Go! ${this.getPokemon().name}!`);
      if (this.player)
         this.scene.pbTray.hide();
      this.scene.trainer.setTexture(`trainer_${this.scene.gameData.gender === PlayerGender.FEMALE ? 'f' : 'm'}_back_pb`);
      this.scene.time.delayedCall(562, () => {
        this.scene.trainer.setFrame('2');
        this.scene.time.delayedCall(64, () => {
          this.scene.trainer.setFrame('3');
        });
      });
      this.scene.tweens.add({
        targets: this.scene.trainer,
        x: -36,
        duration: 1000,
        onComplete: () => this.scene.trainer.setVisible(false)
      });
      this.scene.time.delayedCall(750, () => this.summon());
    } else {
      this.scene.pbTrayEnemy.hide();
      this.scene.ui.showText(`${this.scene.currentBattle.trainer.getName(!(this.fieldIndex % 2) ? TrainerSlot.TRAINER : TrainerSlot.TRAINER_PARTNER)} sent out\n${this.getPokemon().name}!`, null, () => this.summon());
    }
  }

  summon(): void {
    const pokemon = this.getPokemon();

    const pokeball = this.scene.addFieldSprite(this.player ? 36 : 248, this.player ? 80 : 44, 'pb', getPokeballAtlasKey(pokemon.pokeball));
    pokeball.setVisible(false);
    pokeball.setOrigin(0.5, 0.625);
    this.scene.field.add(pokeball);

    if (this.fieldIndex === 1)
      pokemon.setFieldPosition(FieldPosition.RIGHT, 0);
    else {
      const availablePartyMembers = this.getParty().filter(p => !p.isFainted()).length;
      pokemon.setFieldPosition(!this.scene.currentBattle.double || availablePartyMembers === 1 ? FieldPosition.CENTER : FieldPosition.LEFT);
    }

    const fpOffset = pokemon.getFieldPositionOffset();

    pokeball.setVisible(true);

    this.scene.tweens.add({
      targets: pokeball,
      duration: 650,
      x: (this.player ? 100 : 236) + fpOffset[0]
    });

    this.scene.tweens.add({
      targets: pokeball,
      duration: 150,
      ease: 'Cubic.easeOut',
      y: (this.player ? 70 : 34) + fpOffset[1],
      onComplete: () => {
        this.scene.tweens.add({
          targets: pokeball,
          duration: 500,
          ease: 'Cubic.easeIn',
          angle: 1440,
          y: (this.player ? 132 : 86) + fpOffset[1],
          onComplete: () => {
            this.scene.playSound('pb_rel');
            pokeball.destroy();
            this.scene.add.existing(pokemon);
            this.scene.field.add(pokemon);
            if (!this.player) {
              const playerPokemon = this.scene.getPlayerPokemon() as Pokemon;
              if (playerPokemon?.visible)
                this.scene.field.moveBelow(pokemon, playerPokemon);
              this.scene.currentBattle.seenEnemyPartyMemberIds.add(pokemon.id);
            }
            addPokeballOpenParticles(this.scene, pokemon.x, pokemon.y - 16, pokemon.pokeball);
            this.scene.updateModifiers(this.player);
            this.scene.updateFieldScale();
            pokemon.showInfo();
            pokemon.playAnim();
            pokemon.setVisible(true);
            pokemon.getSprite().setVisible(true);
            pokemon.setScale(0.5);
            pokemon.tint(getPokeballTintColor(pokemon.pokeball));
            pokemon.untint(250, 'Sine.easeIn');
            this.scene.updateFieldScale();
            this.scene.tweens.add({
              targets: pokemon,
              duration: 250,
              ease: 'Sine.easeIn',
              scale: pokemon.getSpriteScale(),
              onComplete: () => {
                pokemon.cry(pokemon.getHpRatio() > 0.25 ? undefined : { rate: 0.85 });
                pokemon.getSprite().clearTint();
                pokemon.resetSummonData();
                this.scene.time.delayedCall(1000, () => this.end());
              }
            });
          }
        });
      }
    });
  }

  onEnd(): void {
    const pokemon = this.getPokemon();

    if (pokemon.isShiny())
      this.scene.unshiftPhase(new ShinySparklePhase(this.scene, pokemon.getBattlerIndex()));

    pokemon.resetTurnData();

    if (!this.loaded || this.scene.currentBattle.battleType === BattleType.TRAINER || (this.scene.currentBattle.waveIndex % 10) === 1) {
      this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeActiveTrigger, true);

      this.queuePostSummon();
    }
  }

  queuePostSummon(): void {
    this.scene.pushPhase(new PostSummonPhase(this.scene, this.getPokemon().getBattlerIndex()));
  }

  end() {
    this.onEnd();

    super.end();
  }
}

export class SwitchSummonPhase extends SummonPhase {
  private slotIndex: integer;
  private doReturn: boolean;
  private batonPass: boolean;

  private lastPokemon: Pokemon;

  constructor(scene: BattleScene, fieldIndex: integer, slotIndex: integer, doReturn: boolean, batonPass: boolean, player?: boolean) {
    super(scene, fieldIndex, player !== undefined ? player : true);

    this.slotIndex = slotIndex;
    this.doReturn = doReturn;
    this.batonPass = batonPass;
  }

  preSummon(): void {
    if (!this.player) {
      if (this.slotIndex === -1)
        this.slotIndex = this.scene.currentBattle.trainer.getNextSummonIndex(!this.fieldIndex ? TrainerSlot.TRAINER : TrainerSlot.TRAINER_PARTNER);
      if (this.slotIndex > -1) {
        this.showEnemyTrainer(!(this.fieldIndex % 2) ? TrainerSlot.TRAINER : TrainerSlot.TRAINER_PARTNER);
        this.scene.pbTrayEnemy.showPbTray(this.scene.getEnemyParty());
      }
    }

    if (!this.doReturn || (this.slotIndex !== -1 && !(this.player ? this.scene.getParty() : this.scene.getEnemyParty())[this.slotIndex])) {
      if (this.player)
        return this.switchAndSummon();
      else {
        this.scene.time.delayedCall(750, () => this.switchAndSummon());
        return;
      }
    }

    const pokemon = this.getPokemon();

    if (!this.batonPass)
      (this.player ? this.scene.getEnemyField() : this.scene.getPlayerField()).forEach(enemyPokemon => enemyPokemon.removeTagsBySourceId(pokemon.id));

    applyPreSwitchOutAbAttrs(PreSwitchOutAbAttr, pokemon);

    this.scene.ui.showText(this.player ?
      i18next.t('menu:playerComeBack', { pokemonName: pokemon.name }) :
      i18next.t('menu:trainerComeBack', {
        trainerName: this.scene.currentBattle.trainer.getName(!(this.fieldIndex % 2) ? TrainerSlot.TRAINER : TrainerSlot.TRAINER_PARTNER),
        pokemonName: pokemon.name
      })
    );
    this.scene.playSound('pb_rel');
    pokemon.hideInfo();
    pokemon.tint(getPokeballTintColor(pokemon.pokeball), 1, 250, 'Sine.easeIn');
    this.scene.tweens.add({
      targets: pokemon,
      duration: 250,
      ease: 'Sine.easeIn',
      scale: 0.5,
      onComplete: () => {
        pokemon.setVisible(false);
        this.scene.field.remove(pokemon);
        this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeActiveTrigger, true);
        this.scene.time.delayedCall(750, () => this.switchAndSummon());
      }
    });
  }

  switchAndSummon() {
    const party = this.player ? this.getParty() : this.scene.getEnemyParty();
    const switchedPokemon = party[this.slotIndex];
    this.lastPokemon = this.getPokemon();
    if (this.batonPass && switchedPokemon) {
      (this.player ? this.scene.getEnemyField() : this.scene.getPlayerField()).forEach(enemyPokemon => enemyPokemon.transferTagsBySourceId(this.lastPokemon.id, switchedPokemon.id));
      if (!this.scene.findModifier(m => m instanceof SwitchEffectTransferModifier && (m as SwitchEffectTransferModifier).pokemonId === switchedPokemon.id)) {
        const batonPassModifier = this.scene.findModifier(m => m instanceof SwitchEffectTransferModifier
          && (m as SwitchEffectTransferModifier).pokemonId === this.lastPokemon.id) as SwitchEffectTransferModifier;
        if (batonPassModifier && !this.scene.findModifier(m => m instanceof SwitchEffectTransferModifier && (m as SwitchEffectTransferModifier).pokemonId === switchedPokemon.id))
          this.scene.tryTransferHeldItemModifier(batonPassModifier, switchedPokemon, false, false);
      }
    }
    if (switchedPokemon) {
      party[this.slotIndex] = this.lastPokemon;
      party[this.fieldIndex] = switchedPokemon;
      const showTextAndSummon = () => {
        this.scene.ui.showText(this.player ?
          i18next.t('menu:playerGo', { pokemonName: switchedPokemon.name }) :
          i18next.t('menu:trainerGo', {
            trainerName: this.scene.currentBattle.trainer.getName(!(this.fieldIndex % 2) ? TrainerSlot.TRAINER : TrainerSlot.TRAINER_PARTNER),
            pokemonName: this.getPokemon().name
          })
        );
        this.summon();
      };
      if (this.player)
        showTextAndSummon();
      else {
        this.scene.time.delayedCall(1500, () => {
          this.hideEnemyTrainer();
          this.scene.pbTrayEnemy.hide();
          showTextAndSummon();
        });
      }
    } else
      this.end();
  }

  onEnd(): void {
    super.onEnd();

    const pokemon = this.getPokemon();

    // Compensate for turn spent summoning
    if (pokemon.scene.currentBattle.turnCommands[this.fieldIndex]?.command === Command.POKEMON)
      pokemon.battleSummonData.turnCount--;

    if (this.batonPass && pokemon)
      pokemon.transferSummon(this.lastPokemon);

    this.lastPokemon?.resetSummonData();

    this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeActiveTrigger, true);
  }

  queuePostSummon(): void {
    this.scene.unshiftPhase(new PostSummonPhase(this.scene, this.getPokemon().getBattlerIndex()));
  }
}

export class ReturnPhase extends SwitchSummonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex, -1, true, false);
  }

  switchAndSummon(): void {
    this.end();
  }

  summon(): void { }

  onEnd(): void {
    const pokemon = this.getPokemon();

    pokemon.resetTurnData();
    pokemon.resetSummonData();

    this.scene.updateFieldScale();

    this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeActiveTrigger);
  }
}

export class ShowTrainerPhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.trainer.setVisible(true)

    this.scene.trainer.setTexture(`trainer_${this.scene.gameData.gender === PlayerGender.FEMALE ? 'f' : 'm'}_back`);

    this.scene.tweens.add({
      targets: this.scene.trainer,
      x: 106,
      duration: 1000,
      onComplete: () => this.end()
    });
  }
}

export class ToggleDoublePositionPhase extends BattlePhase {
  private double: boolean;

  constructor(scene: BattleScene, double: boolean) {
    super(scene);

    this.double = double;
  }

  start() {
    super.start();

    const playerPokemon = this.scene.getPlayerField().find(p => p.isActive(true));
    if (playerPokemon) {
      playerPokemon.setFieldPosition(this.double && this.scene.getParty().filter(p => !p.isFainted()).length > 1 ? FieldPosition.LEFT : FieldPosition.CENTER, 500).then(() => {
        if (playerPokemon.getFieldIndex() === 1) {
          const party = this.scene.getParty();
          party[1] = party[0];
          party[0] = playerPokemon;
        }
        this.end();
      });
    } else
      this.end();
  }
}

export class CheckSwitchPhase extends BattlePhase {
  protected fieldIndex: integer;
  protected useName: boolean;

  constructor(scene: BattleScene, fieldIndex: integer, useName: boolean) {
    super(scene);

    this.fieldIndex = fieldIndex;
    this.useName = useName;
  }

  start() {
    super.start();

    const pokemon = this.scene.getPlayerField()[this.fieldIndex];

    if (this.scene.field.getAll().indexOf(pokemon) === -1) {
      this.scene.unshiftPhase(new SummonMissingPhase(this.scene, this.fieldIndex));
      super.end();
      return;
    }

    if (!this.scene.getParty().slice(1).filter(p => p.isActive()).length) {
      super.end();
      return;
    }

    if (pokemon.getTag(BattlerTagType.FRENZY)) {
      super.end();
      return;
    }

    this.scene.ui.showText(i18next.t('menu:switchQuestion', { pokemonName: this.useName ? pokemon.name : i18next.t('menu:pokemon') }), null, () => {
      this.scene.ui.setMode(Mode.CONFIRM, () => {
        this.scene.ui.setMode(Mode.MESSAGE);
        this.scene.tryRemovePhase(p => p instanceof PostSummonPhase && p.player && p.fieldIndex === this.fieldIndex);
        this.scene.unshiftPhase(new SwitchPhase(this.scene, this.fieldIndex, false, true));
        this.end();
      }, () => {
        this.scene.ui.setMode(Mode.MESSAGE);
        this.end();
      });
    });
  }
}

export class SummonMissingPhase extends SummonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex);
  }

  preSummon(): void {
    this.scene.ui.showText(i18next.t('menu:sendOutPokemon', { pokemonName: this.getPokemon().name}));
    this.scene.time.delayedCall(250, () => this.summon());
  }
}

export class LevelCapPhase extends FieldPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    super.start();

    this.scene.ui.setMode(Mode.MESSAGE).then(() => {
      this.scene.playSound('level_up_fanfare');
      this.scene.ui.showText(i18next.t('menu:levelCapUp', { levelCap: this.scene.getMaxExpLevel() }), null, () => this.end(), null, true);
      this.executeForAll(pokemon => pokemon.updateInfo(true));
    });
  }
}

export class TurnInitPhase extends FieldPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    //this.scene.pushPhase(new MoveAnimTestPhase(this.scene));

    this.scene.getField().forEach((pokemon, i) => {
      if (pokemon?.isActive()) {
        if (pokemon.isPlayer())
          this.scene.currentBattle.addParticipant(pokemon as PlayerPokemon);

        pokemon.resetTurnData();

        this.scene.pushPhase(pokemon.isPlayer() ? new CommandPhase(this.scene, i) : new EnemyCommandPhase(this.scene, i - BattlerIndex.ENEMY));
      }
    });

    this.scene.pushPhase(new TurnStartPhase(this.scene));

    this.end();
  }
}

export class CommandPhase extends FieldPhase {
  protected fieldIndex: integer;

  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene);

    this.fieldIndex = fieldIndex;
  }

  start() {
    super.start();

    if (this.fieldIndex) {
      const allyCommand = this.scene.currentBattle.turnCommands[this.fieldIndex - 1];
      if (allyCommand.command === Command.BALL || allyCommand.command === Command.RUN)
        this.scene.currentBattle.turnCommands[this.fieldIndex] = { command: allyCommand.command, skip: true };
    }

    if (this.scene.currentBattle.turnCommands[this.fieldIndex]?.skip)
      return this.end();

    const playerPokemon = this.scene.getPlayerField()[this.fieldIndex];

    const moveQueue = playerPokemon.getMoveQueue();

    while (moveQueue.length && moveQueue[0]
      && moveQueue[0].move && (!playerPokemon.getMoveset().find(m => m.moveId === moveQueue[0].move)
      || !playerPokemon.getMoveset()[playerPokemon.getMoveset().findIndex(m => m.moveId === moveQueue[0].move)].isUsable(playerPokemon, moveQueue[0].ignorePP)))
        moveQueue.shift();

    if (moveQueue.length) {
      const queuedMove = moveQueue[0];
      if (!queuedMove.move)
        this.handleCommand(Command.FIGHT, -1, false);
      else {
        const moveIndex = playerPokemon.getMoveset().findIndex(m => m.moveId === queuedMove.move);
        if (moveIndex > -1 && playerPokemon.getMoveset()[moveIndex].isUsable(playerPokemon, queuedMove.ignorePP)) {
          this.handleCommand(Command.FIGHT, moveIndex, queuedMove.ignorePP, { targets: queuedMove.targets, multiple: queuedMove.targets.length > 1 });
        } else
          this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
      }
    } else
      this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
  }

  handleCommand(command: Command, cursor: integer, ...args: any[]): boolean {
    const playerPokemon = this.scene.getPlayerField()[this.fieldIndex];
    const enemyField = this.scene.getEnemyField();
    let success: boolean;

    switch (command) {
      case Command.FIGHT:
        let useStruggle = false;
        if (cursor === -1 || playerPokemon.trySelectMove(cursor, args[0] as boolean) || (useStruggle = cursor > -1 && !playerPokemon.getMoveset().filter(m => m.isUsable(playerPokemon)).length)) {
          const moveId = !useStruggle ? cursor > -1 ? playerPokemon.getMoveset()[cursor].moveId : Moves.NONE : Moves.STRUGGLE;
          const turnCommand: TurnCommand = { command: Command.FIGHT, cursor: cursor, move: { move: moveId, targets: [], ignorePP: args[0] }, args: args };
          const moveTargets: MoveTargetSet = args.length < 3 ? getMoveTargets(playerPokemon, moveId) : args[2];
          if (moveId) {
            const move = playerPokemon.getMoveset()[cursor];
            if (move.getName().endsWith(' (N)')) {
              this.scene.ui.setMode(Mode.MESSAGE);
              this.scene.ui.showText(i18next.t('menu:moveNotImplemented', { moveName: move.getName().slice(0, -4) }), null, () => {
                this.scene.ui.clearText();
                this.scene.ui.setMode(Mode.FIGHT, this.fieldIndex);
              }, null, true);
              return;
            }
          } else
            turnCommand.targets = [ this.fieldIndex ];
          console.log(moveTargets, playerPokemon.name);
          if (moveTargets.targets.length <= 1 || moveTargets.multiple)
            turnCommand.move.targets = moveTargets.targets;
          else
            this.scene.unshiftPhase(new SelectTargetPhase(this.scene, this.fieldIndex));
          this.scene.currentBattle.turnCommands[this.fieldIndex] = turnCommand;
          success = true;
        } else if (cursor < playerPokemon.getMoveset().length) {
          const move = playerPokemon.getMoveset()[cursor];
          if (playerPokemon.summonData.disabledMove === move.moveId) {
            this.scene.ui.setMode(Mode.MESSAGE);
            this.scene.ui.showText(i18next.t('menu:moveDisabled', { moveName: move.getName() }), null, () => {
              this.scene.ui.clearText();
              this.scene.ui.setMode(Mode.FIGHT, this.fieldIndex);
            }, null, true);
          }
        }
        break;
      case Command.BALL:
        if (this.scene.arena.biomeType === Biome.END && (!this.scene.gameMode.isClassic || this.scene.gameData.getStarterCount(d => !!d.caughtAttr) < Object.keys(speciesStarters).length - 1)) {
          this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.showText(i18next.t('menu:noPokeballForce'), null, () => {
            this.scene.ui.showText(null, 0);
            this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          }, null, true);
        } else if (this.scene.currentBattle.battleType === BattleType.TRAINER) {
          this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.showText(i18next.t('menu:noPokeballTrainer'), null, () => {
            this.scene.ui.showText(null, 0);
            this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          }, null, true);
        } else {
          const targets = this.scene.getEnemyField().filter(p => p.isActive(true)).map(p => p.getBattlerIndex());
          if (targets.length > 1) {
            this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
            this.scene.ui.setMode(Mode.MESSAGE);
            this.scene.ui.showText(i18next.t('menu:noPokeballMulti'), null, () => {
              this.scene.ui.showText(null, 0);
              this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
            }, null, true);
          } else if (cursor < 5) {
            const targetPokemon = this.scene.getEnemyField().find(p => p.isActive(true));
            if (targetPokemon.isBoss() && targetPokemon.bossSegmentIndex >= 1 && cursor < PokeballType.MASTER_BALL) {
              this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
              this.scene.ui.setMode(Mode.MESSAGE);
              this.scene.ui.showText(i18next.t('menu:noPokeballStrong'), null, () => {
                this.scene.ui.showText(null, 0);
                this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
              }, null, true);
            } else {
              this.scene.currentBattle.turnCommands[this.fieldIndex] = { command: Command.BALL, cursor: cursor };
              this.scene.currentBattle.turnCommands[this.fieldIndex].targets = targets;
              if (this.fieldIndex)
                this.scene.currentBattle.turnCommands[this.fieldIndex - 1].skip = true;
              success = true;
            }
          }
        }
        break;
      case Command.POKEMON:
      case Command.RUN:
        const isSwitch = command === Command.POKEMON;
        if (!isSwitch && this.scene.arena.biomeType === Biome.END) {
          this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.showText(i18next.t('menu:noEscapeForce'), null, () => {
            this.scene.ui.showText(null, 0);
            this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          }, null, true);
        } else if (!isSwitch && this.scene.currentBattle.battleType === BattleType.TRAINER) {
          this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.ui.showText(i18next.t('menu:noEscapeTrainer'), null, () => {
            this.scene.ui.showText(null, 0);
            this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
          }, null, true);
        } else {
          const trapTag = playerPokemon.findTag(t => t instanceof TrappedTag) as TrappedTag;
          const trapped = new Utils.BooleanHolder(false);
          const batonPass = isSwitch && args[0] as boolean;
          if (!batonPass)
            enemyField.forEach(enemyPokemon => applyCheckTrappedAbAttrs(CheckTrappedAbAttr, enemyPokemon, trapped));
          if (batonPass || (!trapTag && !trapped.value)) {
            this.scene.currentBattle.turnCommands[this.fieldIndex] = isSwitch
              ? { command: Command.POKEMON, cursor: cursor, args: args }
              : { command: Command.RUN };
            success = true;
            if (!isSwitch && this.fieldIndex)
              this.scene.currentBattle.turnCommands[this.fieldIndex - 1].skip = true;
          } else if (trapTag) {
            if (!isSwitch) {
              this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
              this.scene.ui.setMode(Mode.MESSAGE);
            }
            this.scene.ui.showText(
              i18next.t('menu:noEscapePokemon', {
                pokemonName: this.scene.getPokemonById(trapTag.sourceId).name,
                moveName: trapTag.getMoveName(),
                escapeVerb: isSwitch ? i18next.t('menu:escapeVerbSwitch') : i18next.t('menu:escapeVerbFlee')
              }),
              null,
              () => {
                this.scene.ui.showText(null, 0);
                if (!isSwitch)
                  this.scene.ui.setMode(Mode.COMMAND, this.fieldIndex);
              }, null, true);
          }
        }
        break;
    }

    if (success)
      this.end();

    return success;
  }

  cancel() {
    if (this.fieldIndex) {
      this.scene.unshiftPhase(new CommandPhase(this.scene, 0));
      this.scene.unshiftPhase(new CommandPhase(this.scene, 1));
      this.end();
    }
  }

  checkFightOverride(): boolean {
    const pokemon = this.getPokemon();

    const encoreTag = pokemon.getTag(EncoreTag) as EncoreTag;

    if (!encoreTag)
      return false;

    const moveIndex = pokemon.getMoveset().findIndex(m => m.moveId === encoreTag.moveId);

    if (moveIndex === -1 || !pokemon.getMoveset()[moveIndex].isUsable(pokemon))
      return false;

    this.handleCommand(Command.FIGHT, moveIndex, false);

    return true;
  }

  getFieldIndex(): integer {
    return this.fieldIndex;
  }

  getPokemon(): PlayerPokemon {
    return this.scene.getPlayerField()[this.fieldIndex];
  }

  end() {
    this.scene.ui.setMode(Mode.MESSAGE).then(() => super.end());
  }
}

export class EnemyCommandPhase extends FieldPhase {
  protected fieldIndex: integer;

  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene);

    this.fieldIndex = fieldIndex;
  }

  start() {
    super.start();

    const enemyPokemon = this.scene.getEnemyField()[this.fieldIndex];

    const battle = this.scene.currentBattle;

    const trainer = battle.trainer;

    if (trainer && !enemyPokemon.getMoveQueue().length) {
      const opponents = enemyPokemon.getOpponents();

      const trapTag = enemyPokemon.findTag(t => t instanceof TrappedTag) as TrappedTag;
      const trapped = new Utils.BooleanHolder(false);
      opponents.forEach(playerPokemon => applyCheckTrappedAbAttrs(CheckTrappedAbAttr, playerPokemon, trapped));
      if (!trapTag && !trapped.value) {
        const partyMemberScores = trainer.getPartyMemberMatchupScores(enemyPokemon.trainerSlot, true);

        if (partyMemberScores.length) {
          const matchupScores = opponents.map(opp => enemyPokemon.getMatchupScore(opp));
          const matchupScore = matchupScores.reduce((total, score) => total += score, 0) / matchupScores.length;
          
          const sortedPartyMemberScores = trainer.getSortedPartyMemberMatchupScores(partyMemberScores);

          const switchMultiplier = 1 - (battle.enemySwitchCounter ? Math.pow(0.1, (1 / battle.enemySwitchCounter)) : 0);

          if (sortedPartyMemberScores[0][1] * switchMultiplier >= matchupScore * (trainer.config.isBoss ? 2 : 3)) {
            const index = trainer.getNextSummonIndex(enemyPokemon.trainerSlot, partyMemberScores);

            battle.turnCommands[this.fieldIndex + BattlerIndex.ENEMY] =
              { command: Command.POKEMON, cursor: index, args: [ false ] };
            
            battle.enemySwitchCounter++;

            return this.end();
          }
        }
      }
    }

    const nextMove = enemyPokemon.getNextMove();

    this.scene.currentBattle.turnCommands[this.fieldIndex + BattlerIndex.ENEMY] =
      { command: Command.FIGHT, move: nextMove };

    this.scene.currentBattle.enemySwitchCounter = Math.max(this.scene.currentBattle.enemySwitchCounter - 1, 0);

    this.end();
  }
}

export class SelectTargetPhase extends PokemonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex);
  }

  start() {
    super.start();

    const turnCommand = this.scene.currentBattle.turnCommands[this.fieldIndex];
    const move = turnCommand.move?.move;
    this.scene.ui.setMode(Mode.TARGET_SELECT, this.fieldIndex, move, (cursor: integer) => {
      this.scene.ui.setMode(Mode.MESSAGE);
      if (cursor === -1) {
        this.scene.currentBattle.turnCommands[this.fieldIndex] = null;
        this.scene.unshiftPhase(new CommandPhase(this.scene, this.fieldIndex));
      } else
        turnCommand.targets = [ cursor ];
      if (turnCommand.command === Command.BALL && this.fieldIndex)
        this.scene.currentBattle.turnCommands[this.fieldIndex - 1].skip = true;
      this.end();
    });
  }
}

export class TurnStartPhase extends FieldPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    const field = this.scene.getField();
    const order = this.getOrder();

    const moveOrder = order.slice(0);

    moveOrder.sort((a, b) => {
      const aCommand = this.scene.currentBattle.turnCommands[a];
      const bCommand = this.scene.currentBattle.turnCommands[b];

      if (aCommand.command !== bCommand.command) {
        if (aCommand.command === Command.FIGHT)
          return 1;
        else if (bCommand.command === Command.FIGHT)
          return -1;
      } else if (aCommand.command === Command.FIGHT) {
        const aMove = allMoves[aCommand.move.move];
        const bMove = allMoves[bCommand.move.move];

        const aPriority = new Utils.IntegerHolder(aMove.priority);
        const bPriority = new Utils.IntegerHolder(bMove.priority);

		    applyAbAttrs(IncrementMovePriorityAbAttr, this.scene.getField().find(p => p?.isActive() && p.getBattlerIndex() === a), null, aMove, aPriority);
        applyAbAttrs(IncrementMovePriorityAbAttr, this.scene.getField().find(p => p?.isActive() && p.getBattlerIndex() === b), null, bMove, bPriority);
        
        if (aPriority.value !== bPriority.value)
          return aPriority.value < bPriority.value ? 1 : -1;
      }
      
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);

      return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
    });

    for (let o of moveOrder) {

      const pokemon = field[o];
      const turnCommand = this.scene.currentBattle.turnCommands[o];

      if (turnCommand.skip)
        continue;

      switch (turnCommand.command) {
        case Command.FIGHT:
          const queuedMove = turnCommand.move;
          if (!queuedMove)
            continue;
          const move = pokemon.getMoveset().find(m => m.moveId === queuedMove.move) || new PokemonMove(queuedMove.move);
          if (pokemon.isPlayer()) {
            if (turnCommand.cursor === -1)
              this.scene.pushPhase(new MovePhase(this.scene, pokemon, turnCommand.targets || turnCommand.move.targets, move));
            else {
              const playerPhase = new MovePhase(this.scene, pokemon, turnCommand.targets || turnCommand.move.targets, move, false, queuedMove.ignorePP);
              this.scene.pushPhase(playerPhase);
            }
          } else
            this.scene.pushPhase(new MovePhase(this.scene, pokemon, turnCommand.targets || turnCommand.move.targets, move, false, queuedMove.ignorePP));
          break;
        case Command.BALL:
          this.scene.unshiftPhase(new AttemptCapturePhase(this.scene, turnCommand.targets[0] % 2, turnCommand.cursor));
          break;
        case Command.POKEMON:
        case Command.RUN:
          const isSwitch = turnCommand.command === Command.POKEMON;
          if (isSwitch)
            this.scene.unshiftPhase(new SwitchSummonPhase(this.scene, pokemon.getFieldIndex(), turnCommand.cursor, true, turnCommand.args[0] as boolean, pokemon.isPlayer()));
          else
            this.scene.unshiftPhase(new AttemptRunPhase(this.scene, pokemon.getFieldIndex()));
          break;
      }
    }

    if (this.scene.arena.weather)
      this.scene.pushPhase(new WeatherEffectPhase(this.scene, this.scene.arena.weather));

    for (let o of order) {
      if (field[o].status && field[o].status.isPostTurn())
        this.scene.pushPhase(new PostTurnStatusEffectPhase(this.scene, o));
    }

    this.scene.pushPhase(new TurnEndPhase(this.scene));

    this.end();
  }
}

export class TurnEndPhase extends FieldPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.currentBattle.incrementTurn(this.scene);
    
    const handlePokemon = (pokemon: Pokemon) => {
      pokemon.lapseTags(BattlerTagLapseType.TURN_END);
      
      if (pokemon.summonData.disabledMove && !--pokemon.summonData.disabledTurns) {
        this.scene.pushPhase(new MessagePhase(this.scene, i18next.t('menu:notDisabled', { moveName: allMoves[pokemon.summonData.disabledMove].name })));
        pokemon.summonData.disabledMove = Moves.NONE;
      }

      const hasUsableBerry = !!this.scene.findModifier(m => m instanceof BerryModifier && m.shouldApply([ pokemon ]), pokemon.isPlayer());
      if (hasUsableBerry)
        this.scene.unshiftPhase(new BerryPhase(this.scene, pokemon.getBattlerIndex()));

      this.scene.applyModifiers(TurnHealModifier, pokemon.isPlayer(), pokemon);

      if (this.scene.arena.terrain?.terrainType === TerrainType.GRASSY && pokemon.isGrounded()) {
        this.scene.unshiftPhase(new PokemonHealPhase(this.scene, pokemon.getBattlerIndex(),
          Math.max(pokemon.getMaxHp() >> 4, 1), getPokemonMessage(pokemon, '\'s HP was restored.'), true));
      }

      if (!pokemon.isPlayer()) {
        this.scene.applyModifiers(EnemyTurnHealModifier, false, pokemon);
        this.scene.applyModifier(EnemyStatusEffectHealChanceModifier, false, pokemon);
      }

      applyPostTurnAbAttrs(PostTurnAbAttr, pokemon);

      this.scene.applyModifiers(TurnHeldItemTransferModifier, pokemon.isPlayer(), pokemon);

      pokemon.battleSummonData.turnCount++;
    };

    this.executeForAll(handlePokemon);
      
    this.scene.arena.lapseTags();

    if (this.scene.arena.weather && !this.scene.arena.weather.lapse())
      this.scene.arena.trySetWeather(WeatherType.NONE, false);

    if (this.scene.arena.terrain && !this.scene.arena.terrain.lapse())
      this.scene.arena.trySetTerrain(TerrainType.NONE, false);

    this.end();
  }
}

export class BattleEndPhase extends BattlePhase {
  start() {
    super.start();

    this.scene.currentBattle.addBattleScore(this.scene);
    if (this.scene.currentBattle.moneyScattered)
      this.scene.currentBattle.pickUpScatteredMoney(this.scene);

    this.scene.gameData.gameStats.battles++;
    if (this.scene.currentBattle.trainer)
      this.scene.gameData.gameStats.trainersDefeated++;
    if (this.scene.gameMode.isEndless && this.scene.currentBattle.waveIndex + 1 > this.scene.gameData.gameStats.highestEndlessWave)
			this.scene.gameData.gameStats.highestEndlessWave = this.scene.currentBattle.waveIndex + 1;

    for (let pokemon of this.scene.getField()) {
      if (pokemon)
        pokemon.resetBattleSummonData();
    }

    for (let pokemon of this.scene.getParty().filter(p => !p.isFainted()))
      applyPostBattleAbAttrs(PostBattleAbAttr, pokemon);

    this.scene.clearEnemyHeldItemModifiers();

    const lapsingModifiers = this.scene.findModifiers(m => m instanceof LapsingPersistentModifier || m instanceof LapsingPokemonHeldItemModifier) as (LapsingPersistentModifier | LapsingPokemonHeldItemModifier)[];
    for (let m of lapsingModifiers) {
      const args: any[] = [];
      if (m instanceof LapsingPokemonHeldItemModifier)
        args.push(this.scene.getPokemonById(m.pokemonId));
      if (!m.lapse(args))
        this.scene.removeModifier(m);
    }

    this.scene.updateModifiers().then(() => this.end());
  }
}

export class NewBattlePhase extends BattlePhase {
  start() {
    super.start();

    this.scene.newBattle();

    this.end();
  }
}

export class CommonAnimPhase extends PokemonPhase {
  private anim: CommonAnim;
  private targetIndex: integer;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, targetIndex: BattlerIndex, anim: CommonAnim) {
    super(scene, battlerIndex);

    this.anim = anim;
    this.targetIndex = targetIndex;
  }

  start() {
    new CommonBattleAnim(this.anim, this.getPokemon(), this.targetIndex !== undefined ? (this.player ? this.scene.getEnemyField() : this.scene.getPlayerField())[this.targetIndex] : this.getPokemon()).play(this.scene, () => {
      this.end();
    });
  }
}

export class MovePhase extends BattlePhase {
  public pokemon: Pokemon;
  public move: PokemonMove;
  public targets: BattlerIndex[];
  protected followUp: boolean;
  protected ignorePp: boolean;
  protected cancelled: boolean;

  constructor(scene: BattleScene, pokemon: Pokemon, targets: BattlerIndex[], move: PokemonMove, followUp?: boolean, ignorePp?: boolean) {
    super(scene);

    this.pokemon = pokemon;
    this.targets = targets;
    this.move = move;
    this.followUp = !!followUp;
    this.ignorePp = !!ignorePp;
    this.cancelled = false;
  }

  canMove(): boolean {
    return this.pokemon.isActive(true) && this.move.isUsable(this.pokemon, this.ignorePp) && !!this.targets.length;
  }

  cancel(): void {
    this.cancelled = true;
  }

  start() {
    super.start();

    console.log(Moves[this.move.moveId]);

    if (!this.canMove()) {
      if (this.move.moveId && this.pokemon.summonData.disabledMove === this.move.moveId)
        this.scene.queueMessage(`${this.move.getName()} is disabled!`);
      return this.end();
    }

    if (!this.followUp) {
      const abilityEffectsIgnored = new Utils.BooleanHolder(false);
      this.scene.getField(true).map(p => applyAbAttrs(MoveAbilityBypassAbAttr, p, abilityEffectsIgnored));
      if (abilityEffectsIgnored.value)
        this.scene.arena.setIgnoreAbilities(true);
    } else {
      this.pokemon.turnData.hitsLeft = undefined;
      this.pokemon.turnData.hitCount = undefined;
    }

    // Move redirection abilities (ie. Storm Drain) only support single target moves
    const moveTarget = this.targets.length === 1
      ? new Utils.IntegerHolder(this.targets[0])
      : null;
    if (moveTarget) {
      this.scene.getField(true).filter(p => p !== this.pokemon).forEach(p => applyAbAttrs(RedirectMoveAbAttr, p, null, this.move.moveId, moveTarget));
      this.targets[0] = moveTarget.value;
    }

    if (this.targets.length === 1 && this.targets[0] === BattlerIndex.ATTACKER) {
      if (this.pokemon.turnData.attacksReceived.length) {
        const attacker = this.pokemon.turnData.attacksReceived.length ? this.pokemon.scene.getPokemonById(this.pokemon.turnData.attacksReceived[0].sourceId) : null;
        if (attacker?.isActive(true))
          this.targets[0] = attacker.getBattlerIndex();
      }
      if (this.targets[0] === BattlerIndex.ATTACKER) {
        this.cancel();
        this.showMoveText();
        this.showFailedText();
      }
    }

    const targets = this.scene.getField(true).filter(p => {
      if (this.targets.indexOf(p.getBattlerIndex()) > -1) {
        const hiddenTag = p.getTag(HiddenTag);
        if (hiddenTag && !this.move.getMove().getAttrs(HitsTagAttr).filter(hta => (hta as HitsTagAttr).tagType === hiddenTag.tagType).length)
          return false;
        return true;
      }
      return false;
    });

    const doMove = () => {
      this.pokemon.turnData.acted = true; // Record that the move was attempted, even if it fails
      
      this.pokemon.lapseTags(BattlerTagLapseType.PRE_MOVE);
	    
      if (!this.followUp && this.canMove() && !this.cancelled) {
        this.pokemon.lapseTags(BattlerTagLapseType.MOVE);
      }
      if (this.cancelled) {
        this.pokemon.pushMoveHistory({ move: Moves.NONE, result: MoveResult.FAIL });
        return this.end();
      }

      const moveQueue = this.pokemon.getMoveQueue();

      this.scene.triggerPokemonFormChange(this.pokemon, SpeciesFormChangePreMoveTrigger);

      if (this.move.moveId)
        this.showMoveText();
      
      if ((moveQueue.length && moveQueue[0].move === Moves.NONE) || !targets.length) {
        moveQueue.shift();
        this.cancel();
      }

      if (this.cancelled) {
        this.pokemon.pushMoveHistory({ move: Moves.NONE, result: MoveResult.FAIL });
        return this.end();
      }

      if (!moveQueue.length || !moveQueue.shift().ignorePP) {
        this.move.ppUsed++;
        const targetedOpponents = this.pokemon.getOpponents().filter(o => this.targets.includes(o.getBattlerIndex()));
        for (let opponent of targetedOpponents) {
          if (this.move.ppUsed === this.move.getMove().pp)
            break;
          if (opponent.hasAbilityWithAttr(IncreasePpAbAttr))
            this.move.ppUsed = Math.min(this.move.ppUsed + 1, this.move.getMovePp());
        }
      }

      if (!allMoves[this.move.moveId].getAttrs(CopyMoveAttr).length)
        this.scene.currentBattle.lastMove = this.move.moveId;

      // Assume conditions affecting targets only apply to moves with a single target
      let success = this.move.getMove().applyConditions(this.pokemon, targets[0], this.move.getMove());
      let failedText = null;
      if (success && this.scene.arena.isMoveWeatherCancelled(this.move.getMove()))
        success = false;
      else if (success && this.scene.arena.isMoveTerrainCancelled(this.pokemon, this.move.getMove())) {
        success = false;
        failedText = getTerrainBlockMessage(targets[0], this.scene.arena.terrain.terrainType);
      }
      if (success)
        this.scene.unshiftPhase(this.getEffectPhase());
      else {
        this.pokemon.pushMoveHistory({ move: this.move.moveId, targets: this.targets, result: MoveResult.FAIL, virtual: this.move.virtual });
        this.showFailedText(failedText);
      }
      
      this.end();
    };

    if (!this.followUp && this.pokemon.status && !this.pokemon.status.isPostTurn()) {
      this.pokemon.status.incrementTurn();
      let activated = false;
      let healed = false;
      
      switch (this.pokemon.status.effect) {
        case StatusEffect.PARALYSIS:
          if (!this.pokemon.randSeedInt(4)) {
            activated = true;
            this.cancelled = true;
          }
          break;
        case StatusEffect.SLEEP:
          applyMoveAttrs(BypassSleepAttr, this.pokemon, null, this.move.getMove());
          healed = this.pokemon.status.turnCount === this.pokemon.status.cureTurn;
          activated = !healed && !this.pokemon.getTag(BattlerTagType.BYPASS_SLEEP);
          this.cancelled = activated;
          break;
        case StatusEffect.FREEZE:
          healed = !!this.move.getMove().findAttr(attr => attr instanceof HealStatusEffectAttr && attr.selfTarget && attr.isOfEffect(StatusEffect.FREEZE)) || !this.pokemon.randSeedInt(5);
          activated = !healed;
          this.cancelled = activated;
          break;
      }
      if (activated) {
        this.scene.queueMessage(getPokemonMessage(this.pokemon, getStatusEffectActivationText(this.pokemon.status.effect)));
        this.scene.unshiftPhase(new CommonAnimPhase(this.scene, this.pokemon.getBattlerIndex(), undefined, CommonAnim.POISON + (this.pokemon.status.effect - 1)));
        doMove();
      } else {
        if (healed) {
          this.scene.queueMessage(getPokemonMessage(this.pokemon, getStatusEffectHealText(this.pokemon.status.effect)));
          this.pokemon.resetStatus();
          this.pokemon.updateInfo();
        }
        doMove();
      }
    } else
      doMove();
  }

  getEffectPhase(): MoveEffectPhase {
    return new MoveEffectPhase(this.scene, this.pokemon.getBattlerIndex(), this.targets, this.move);
  }

  showMoveText(): void {
    if (this.move.getMove().getAttrs(ChargeAttr).length) {
      const lastMove = this.pokemon.getLastXMoves() as TurnMove[];
      if (!lastMove.length || lastMove[0].move !== this.move.getMove().id || lastMove[0].result !== MoveResult.OTHER)
        return;
    }

    if (this.pokemon.getTag(BattlerTagType.RECHARGING))
      return;
    
    this.scene.queueMessage(getPokemonMessage(this.pokemon, ` used\n${this.move.getName()}!`), 500);
    applyMoveAttrs(PreMoveMessageAttr, this.pokemon, this.pokemon.getOpponents().find(() => true), this.move.getMove());
  }

  showFailedText(failedText: string = null): void {
    this.scene.queueMessage(failedText || 'But it failed!');
  }

  end() {
    if (!this.followUp && this.canMove())
      this.scene.unshiftPhase(new MoveEndPhase(this.scene, this.pokemon.getBattlerIndex()));

    super.end();
  }
}

export class MoveEffectPhase extends PokemonPhase {
  public move: PokemonMove;
  protected targets: BattlerIndex[];
  
  constructor(scene: BattleScene, battlerIndex: BattlerIndex, targets: BattlerIndex[], move: PokemonMove) {
    super(scene, battlerIndex);

    this.move = move;
    this.targets = targets;
  }

  start() {
    super.start();

    const user = this.getUserPokemon();
    const targets = this.getTargets();

    if (!user?.isOnField())
      return super.end();

    const overridden = new Utils.BooleanHolder(false);

    // Assume single target for override
    applyMoveAttrs(OverrideMoveEffectAttr, user, this.getTarget(), this.move.getMove(), overridden, this.move.virtual).then(() => {

      if (overridden.value)
        return this.end();
      
      user.lapseTags(BattlerTagLapseType.MOVE_EFFECT);

      if (user.turnData.hitsLeft === undefined) {
        const hitCount = new Utils.IntegerHolder(1);
        // Assume single target for multi hit
        applyMoveAttrs(MultiHitAttr, user, this.getTarget(), this.move.getMove(), hitCount);
        if (this.move.getMove() instanceof AttackMove && !this.move.getMove().getAttrs(FixedDamageAttr).length)
          this.scene.applyModifiers(PokemonMultiHitModifier, user.isPlayer(), user, hitCount, new Utils.IntegerHolder(0));
        user.turnData.hitsLeft = user.turnData.hitCount = hitCount.value;
      }

      const moveHistoryEntry = { move: this.move.moveId, targets: this.targets, result: MoveResult.PENDING, virtual: this.move.virtual };
      user.pushMoveHistory(moveHistoryEntry);

      const targetHitChecks = Object.fromEntries(targets.map(p => [ p.getBattlerIndex(), this.hitCheck(p) ]));
      const activeTargets = targets.map(t => t.isActive(true));
      if (!activeTargets.length || (!this.move.getMove().isMultiTarget() && !targetHitChecks[this.targets[0]])) {
        user.turnData.hitCount = 1;
        user.turnData.hitsLeft = 1;
        if (activeTargets.length) {
          this.scene.queueMessage(getPokemonMessage(user, '\'s\nattack missed!'));
          moveHistoryEntry.result = MoveResult.MISS;
          applyMoveAttrs(MissEffectAttr, user, null, this.move.getMove());
        } else {
          this.scene.queueMessage('But it failed!');
          moveHistoryEntry.result = MoveResult.FAIL;
        }
        return this.end();
      }

      const applyAttrs: Promise<void>[] = [];

      // Move animation only needs one target
      new MoveAnim(this.move.getMove().id as Moves, user, this.getTarget()?.getBattlerIndex()).play(this.scene, () => {
        for (let target of targets) {
          if (!targetHitChecks[target.getBattlerIndex()]) {
            user.turnData.hitCount = 1;
            user.turnData.hitsLeft = 1;
            this.scene.queueMessage(getPokemonMessage(user, '\'s\nattack missed!'));
            if (moveHistoryEntry.result === MoveResult.PENDING)
              moveHistoryEntry.result = MoveResult.MISS;
            applyMoveAttrs(MissEffectAttr, user, null, this.move.getMove());
            continue;
          }

          const isProtected = !this.move.getMove().hasFlag(MoveFlags.IGNORE_PROTECT) && target.findTags(t => t instanceof ProtectedTag).find(t => target.lapseTag(t.tagType));

          const firstHit = moveHistoryEntry.result !== MoveResult.SUCCESS;

          moveHistoryEntry.result = MoveResult.SUCCESS;
          
          const hitResult = !isProtected ? target.apply(user, this.move) : HitResult.NO_EFFECT;

          this.scene.triggerPokemonFormChange(user, SpeciesFormChangePostMoveTrigger);

          applyAttrs.push(new Promise(resolve => {
            applyFilteredMoveAttrs((attr: MoveAttr) => attr instanceof MoveEffectAttr && (attr as MoveEffectAttr).trigger === MoveEffectTrigger.PRE_APPLY && (!attr.firstHitOnly || firstHit),
              user, target, this.move.getMove()).then(() => {
              if (hitResult !== HitResult.FAIL) {
                const chargeEffect = !!this.move.getMove().getAttrs(ChargeAttr).find(ca => (ca as ChargeAttr).usedChargeEffect(user, this.getTarget(), this.move.getMove()));
                // Charge attribute with charge effect takes all effect attributes and applies them to charge stage, so ignore them if this is present
                Utils.executeIf(!chargeEffect, () => applyFilteredMoveAttrs((attr: MoveAttr) => attr instanceof MoveEffectAttr && (attr as MoveEffectAttr).trigger === MoveEffectTrigger.POST_APPLY
                  && (attr as MoveEffectAttr).selfTarget && (!attr.firstHitOnly || firstHit), user, target, this.move.getMove())).then(() => {
                  if (hitResult !== HitResult.NO_EFFECT) {
                    applyFilteredMoveAttrs((attr: MoveAttr) => attr instanceof MoveEffectAttr && (attr as MoveEffectAttr).trigger === MoveEffectTrigger.POST_APPLY
                      && !(attr as MoveEffectAttr).selfTarget && (!attr.firstHitOnly || firstHit), user, target, this.move.getMove()).then(() => {
                      if (hitResult < HitResult.NO_EFFECT) {
                        const flinched = new Utils.BooleanHolder(false);
                        user.scene.applyModifiers(FlinchChanceModifier, user.isPlayer(), user, flinched);
                        if (flinched.value)
                          target.addTag(BattlerTagType.FLINCHED, undefined, this.move.moveId, user.id);
                      }
                      Utils.executeIf(!isProtected && !chargeEffect, () => applyFilteredMoveAttrs((attr: MoveAttr) => attr instanceof MoveEffectAttr && (attr as MoveEffectAttr).trigger === MoveEffectTrigger.HIT && (!attr.firstHitOnly || firstHit),
                        user, target, this.move.getMove()).then(() => {
                          return Utils.executeIf(!target.isFainted() || target.canApplyAbility(), () => applyPostDefendAbAttrs(PostDefendAbAttr, target, user, this.move, hitResult).then(() => {
                            if (!user.isPlayer() && this.move.getMove() instanceof AttackMove)
                              user.scene.applyModifiers(EnemyAttackStatusEffectChanceModifier, false, target);
                          })).then(() => {
                            applyPostAttackAbAttrs(PostAttackAbAttr, user, target, this.move, hitResult).then(() => {
                              if (this.move.getMove() instanceof AttackMove)
                                this.scene.applyModifiers(ContactHeldItemTransferChanceModifier, this.player, user, target.getFieldIndex());
                              resolve();
                            });
                          });
                        })
                      ).then(() => resolve());
                    });
                  } else 
                    applyMoveAttrs(NoEffectAttr, user, null, this.move.getMove()).then(() => resolve());
                });
              } else
                resolve();
            });
          }));
        }
        Promise.allSettled(applyAttrs).then(() => this.end());
      });
    });
  }

  end() {
    const user = this.getUserPokemon();
    if (user) {
      if (--user.turnData.hitsLeft >= 1 && this.getTarget()?.isActive())
        this.scene.unshiftPhase(this.getNewHitPhase());
      else {
        const hitsTotal = user.turnData.hitCount - Math.max(user.turnData.hitsLeft, 0);
        if (hitsTotal > 1)
          this.scene.queueMessage(`Hit ${hitsTotal} time(s)!`);
        this.scene.applyModifiers(HitHealModifier, this.player, user);
      }
    }
    
    super.end();
  }

  hitCheck(target: Pokemon): boolean {
    if (this.move.getMove().moveTarget === MoveTarget.USER)
      return true;

    const user = this.getUserPokemon();

    // Hit check only calculated on first hit for multi-hit moves
    if (user.turnData.hitsLeft < user.turnData.hitCount)
      return true;

    const hiddenTag = target.getTag(HiddenTag);
    if (hiddenTag && !this.move.getMove().getAttrs(HitsTagAttr).filter(hta => (hta as HitsTagAttr).tagType === hiddenTag.tagType).length)
      return false;

    if (user.getTag(BattlerTagType.IGNORE_ACCURACY) && (user.getLastXMoves().find(() => true)?.targets || []).indexOf(target.getBattlerIndex()) > -1)
      return true;

    const moveAccuracy = new Utils.NumberHolder(this.move.getMove().accuracy);

    applyMoveAttrs(VariableAccuracyAttr, user, target, this.move.getMove(), moveAccuracy);

    if (moveAccuracy.value === -1)
      return true;

    if (this.scene.arena.weather?.weatherType === WeatherType.FOG)
      moveAccuracy.value = Math.floor(moveAccuracy.value * 0.9);

    if (!this.move.getMove().getAttrs(OneHitKOAttr).length && this.scene.arena.getTag(ArenaTagType.GRAVITY))
      moveAccuracy.value = Math.floor(moveAccuracy.value * 1.67);
      
    const userAccuracyLevel = new Utils.IntegerHolder(user.summonData.battleStats[BattleStat.ACC]);
    const targetEvasionLevel = new Utils.IntegerHolder(target.summonData.battleStats[BattleStat.EVA]);
    applyAbAttrs(IgnoreOpponentStatChangesAbAttr, target, null, userAccuracyLevel);
    applyAbAttrs(IgnoreOpponentStatChangesAbAttr, user, null, targetEvasionLevel);
    applyMoveAttrs(IgnoreOpponentStatChangesAttr, user, target, this.move.getMove(), targetEvasionLevel);
    this.scene.applyModifiers(TempBattleStatBoosterModifier, this.player, TempBattleStat.ACC, userAccuracyLevel);

    const rand = user.randSeedInt(100, 1);

    const accuracyMultiplier = new Utils.NumberHolder(1);
    if (userAccuracyLevel.value !== targetEvasionLevel.value) {
      accuracyMultiplier.value = userAccuracyLevel.value > targetEvasionLevel.value
        ? (3 + Math.min(userAccuracyLevel.value - targetEvasionLevel.value, 6)) / 3
        : 3 / (3 + Math.min(targetEvasionLevel.value - userAccuracyLevel.value, 6));
    }

    applyBattleStatMultiplierAbAttrs(BattleStatMultiplierAbAttr, user, BattleStat.ACC, accuracyMultiplier);

    const evasionMultiplier = new Utils.NumberHolder(1);
    applyBattleStatMultiplierAbAttrs(BattleStatMultiplierAbAttr, this.getTarget(), BattleStat.EVA, evasionMultiplier);

    accuracyMultiplier.value /= evasionMultiplier.value;

    return rand <= moveAccuracy.value * accuracyMultiplier.value;
  }

  getUserPokemon(): Pokemon {
    if (this.battlerIndex > BattlerIndex.ENEMY_2)
      return this.scene.getPokemonById(this.battlerIndex);
    return (this.player ? this.scene.getPlayerField() : this.scene.getEnemyField())[this.fieldIndex];
  }

  getTargets(): Pokemon[] {
    return this.scene.getField(true).filter(p => this.targets.indexOf(p.getBattlerIndex()) > -1);
  }

  getTarget(): Pokemon {
    return this.getTargets().find(() => true);
  }

  getNewHitPhase() {
    return new MoveEffectPhase(this.scene, this.battlerIndex, this.targets, this.move);
  }
}

export class MoveEndPhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    if (pokemon.isActive(true))
      pokemon.lapseTags(BattlerTagLapseType.AFTER_MOVE);

    this.scene.arena.setIgnoreAbilities(false);

    this.end();
  }
}

export class MoveAnimTestPhase extends BattlePhase {
  private moveQueue: Moves[];

  constructor(scene: BattleScene, moveQueue?: Moves[]) {
    super(scene);

    this.moveQueue = moveQueue || Utils.getEnumValues(Moves).slice(1);
  }

  start() {
    const moveQueue = this.moveQueue.slice(0);
    this.playMoveAnim(moveQueue, true);
  }

  playMoveAnim(moveQueue: Moves[], player: boolean) {
    const moveId = player ? moveQueue[0] : moveQueue.shift();
    if (moveId === undefined) {
      this.playMoveAnim(this.moveQueue.slice(0), true);
      return;
    } else if (player)
      console.log(Moves[moveId]);

    initMoveAnim(moveId).then(() => {
      loadMoveAnimAssets(this.scene, [ moveId ], true)
        .then(() => {
          new MoveAnim(moveId, player ? this.scene.getPlayerPokemon() : this.scene.getEnemyPokemon(), (player !== (allMoves[moveId] instanceof SelfStatusMove) ? this.scene.getEnemyPokemon() : this.scene.getPlayerPokemon()).getBattlerIndex()).play(this.scene, () => {
            if (player)
              this.playMoveAnim(moveQueue, false);
            else
              this.playMoveAnim(moveQueue, true);
          });
      });
    });
  }
}

export class ShowAbilityPhase extends PokemonPhase {
  private passive: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, passive: boolean = false) {
    super(scene, battlerIndex);

    this.passive = passive;
  }

  start() {
    super.start();

    this.scene.abilityBar.showAbility(this.getPokemon(), this.passive);

    this.end();
  }
}

export class StatChangePhase extends PokemonPhase {
  private stats: BattleStat[];
  private selfTarget: boolean;
  private levels: integer;
  private showMessage: boolean;
  private ignoreAbilities: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, selfTarget: boolean, stats: BattleStat[], levels: integer, showMessage: boolean = true, ignoreAbilities: boolean = false) {
    super(scene, battlerIndex);

    this.selfTarget = selfTarget;
    this.stats = stats;
    this.levels = levels;
    this.showMessage = showMessage;
    this.ignoreAbilities = ignoreAbilities;
  }

  start() {
    const pokemon = this.getPokemon();

    if (!pokemon.isActive(true))
      return this.end();

    const allStats = Utils.getEnumValues(BattleStat);
    const filteredStats = this.stats.map(s => s !== BattleStat.RAND ? s : allStats[pokemon.randSeedInt(BattleStat.SPD + 1)]).filter(stat => {
      const cancelled = new Utils.BooleanHolder(false);

      if (!this.selfTarget && this.levels < 0)
        this.scene.arena.applyTagsForSide(MistTag, pokemon.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY, cancelled);

      if (!cancelled.value && !this.selfTarget && this.levels < 0)
        applyPreStatChangeAbAttrs(ProtectStatAbAttr, this.getPokemon(), stat, cancelled);
      
      return !cancelled.value;
    });

    const levels = new Utils.IntegerHolder(this.levels);

    if (!this.ignoreAbilities)
      applyAbAttrs(StatChangeMultiplierAbAttr, pokemon, null, levels);

    const battleStats = this.getPokemon().summonData.battleStats;
    const relLevels = filteredStats.map(stat => (levels.value >= 1 ? Math.min(battleStats[stat] + levels.value, 6) : Math.max(battleStats[stat] + levels.value, -6)) - battleStats[stat]);

    const end = () => {
      if (this.showMessage) {
        const messages = this.getStatChangeMessages(filteredStats, levels.value, relLevels);
        for (let message of messages)
          this.scene.queueMessage(message);
      }

      for (let stat of filteredStats)
        pokemon.summonData.battleStats[stat] = Math.max(Math.min(pokemon.summonData.battleStats[stat] + levels.value, 6), -6);
      
      applyPostStatChangeAbAttrs(PostStatChangeAbAttr, pokemon, filteredStats, this.levels, this.selfTarget)
      this.end();
    };

    if (relLevels.filter(l => l).length && this.scene.moveAnimations) {
      pokemon.enableMask();
      const pokemonMaskSprite = pokemon.maskSprite;

      const tileX = (this.player ? 106 : 236) * pokemon.getSpriteScale() * this.scene.field.scale;
      const tileY = ((this.player ? 148 : 84) + (levels.value >= 1 ? 160 : 0)) * pokemon.getSpriteScale() * this.scene.field.scale;
      const tileWidth = 156 * this.scene.field.scale * pokemon.getSpriteScale();
      const tileHeight = 316 * this.scene.field.scale * pokemon.getSpriteScale();

      const statSprite = this.scene.add.tileSprite(tileX, tileY, tileWidth, tileHeight, 'battle_stats', filteredStats.length > 1 ? 'mix' : BattleStat[filteredStats[0]].toLowerCase());
      statSprite.setPipeline(this.scene.fieldSpritePipeline);
      statSprite.setAlpha(0);
      statSprite.setScale(6);
      statSprite.setOrigin(0.5, 1);

      this.scene.playSound(`stat_${levels.value >= 1 ? 'up' : 'down'}`);

      statSprite.setMask(new Phaser.Display.Masks.BitmapMask(this.scene, pokemonMaskSprite));

      this.scene.tweens.add({
        targets: statSprite,
        duration: 250,
        alpha: 0.8375,
        onComplete: () => {
          this.scene.tweens.add({
            targets: statSprite,
            delay: 1000,
            duration: 250,
            alpha: 0
          });
        }
      });

      this.scene.tweens.add({
        targets: statSprite,
        duration: 1500,
        y: `${levels.value >= 1 ? '-' : '+'}=${160 * 6}`
      });
      
      this.scene.time.delayedCall(1750, () => {
        pokemon.disableMask();
        end();
      });
    } else
      end();
  }

  getStatChangeMessages(stats: BattleStat[], levels: integer, relLevels: integer[]): string[] {
    const messages: string[] = [];
    
    for (let s = 0; s < stats.length; s++)
      messages.push(getPokemonMessage(this.getPokemon(), `'s ${getBattleStatName(stats[s])} ${getBattleStatLevelChangeDescription(Math.abs(relLevels[s]), levels >= 1)}!`));
    return messages;
  }
}

export class WeatherEffectPhase extends CommonAnimPhase {
  public weather: Weather;

  constructor(scene: BattleScene, weather: Weather) {
    super(scene, undefined, undefined, CommonAnim.SUNNY + (weather.weatherType - 1));
    this.weather = weather;
  }

  start() {
    if (this.weather.isDamaging()) {
      
      const cancelled = new Utils.BooleanHolder(false);

      this.executeForAll((pokemon: Pokemon) => applyPreWeatherEffectAbAttrs(SuppressWeatherEffectAbAttr, pokemon, this.weather, cancelled));

      if (!cancelled.value) {
        const inflictDamage = (pokemon: Pokemon) => {
          const cancelled = new Utils.BooleanHolder(false);

          applyPreWeatherEffectAbAttrs(PreWeatherDamageAbAttr, pokemon, this.weather, cancelled);
          applyAbAttrs(BlockNonDirectDamageAbAttr, pokemon, cancelled);

          if (cancelled.value)
            return;

          const damage = Math.ceil(pokemon.getMaxHp() / 16);

          this.scene.queueMessage(getWeatherDamageMessage(this.weather.weatherType, pokemon));
          pokemon.damageAndUpdate(damage, HitResult.EFFECTIVE, false, false, true);
        };

        this.executeForAll((pokemon: Pokemon) => {
          const immune = !pokemon || !!pokemon.getTypes(true, true).filter(t => this.weather.isTypeDamageImmune(t)).length;
          if (!immune)
            inflictDamage(pokemon);
        });
      }
    }

    this.scene.ui.showText(getWeatherLapseMessage(this.weather.weatherType), null, () => {
      this.executeForAll((pokemon: Pokemon) => applyPostWeatherLapseAbAttrs(PostWeatherLapseAbAttr, pokemon, this.weather));

      super.start();
    });
  }
}

export class ObtainStatusEffectPhase extends PokemonPhase {
  private statusEffect: StatusEffect;
  private cureTurn: integer;
  private sourceText: string;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, statusEffect: StatusEffect, cureTurn?: integer, sourceText?: string) {
    super(scene, battlerIndex);

    this.statusEffect = statusEffect;
    this.cureTurn = cureTurn;
    this.sourceText = sourceText;
  }

  start() {
    const pokemon = this.getPokemon();
    if (!pokemon.status) {
      if (pokemon.trySetStatus(this.statusEffect)) {
        if (this.cureTurn)
          pokemon.status.cureTurn = this.cureTurn;
        pokemon.updateInfo(true);
        new CommonBattleAnim(CommonAnim.POISON + (this.statusEffect - 1), pokemon).play(this.scene, () => {
          this.scene.queueMessage(getPokemonMessage(pokemon, getStatusEffectObtainText(this.statusEffect, this.sourceText)));
          if (pokemon.status.isPostTurn())
            this.scene.pushPhase(new PostTurnStatusEffectPhase(this.scene, this.battlerIndex));
          this.end();
        });
        return;
      }
    } else if (pokemon.status.effect === this.statusEffect)
      this.scene.queueMessage(getPokemonMessage(pokemon, getStatusEffectOverlapText(this.statusEffect)));
    this.end();
  }
}

export class PostTurnStatusEffectPhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    const pokemon = this.getPokemon();
    if (pokemon?.isActive(true) && pokemon.status && pokemon.status.isPostTurn()) {
      pokemon.status.incrementTurn();
      const cancelled = new Utils.BooleanHolder(false);
      applyAbAttrs(BlockNonDirectDamageAbAttr, pokemon, cancelled);

      if (!cancelled.value) {
        this.scene.queueMessage(getPokemonMessage(pokemon, getStatusEffectActivationText(pokemon.status.effect)));
        let damage: integer = 0;
        switch (pokemon.status.effect) {
          case StatusEffect.POISON:
            damage = Math.max(pokemon.getMaxHp() >> 3, 1);
            break;
          case StatusEffect.TOXIC:
            damage = Math.max(Math.floor((pokemon.getMaxHp() / 16) * pokemon.status.turnCount), 1);
            break;
          case StatusEffect.BURN:
            damage = Math.max(pokemon.getMaxHp() >> 4, 1);
            break;
        }
        if (damage) {
          this.scene.damageNumberHandler.add(this.getPokemon(), pokemon.damage(damage));
          pokemon.updateInfo();
        }
        new CommonBattleAnim(CommonAnim.POISON + (pokemon.status.effect - 1), pokemon).play(this.scene, () => this.end());
      } else
        this.end();
    } else
      this.end();
  }
}

export class MessagePhase extends Phase {
  private text: string;
  private callbackDelay: integer;
  private prompt: boolean;
  private promptDelay: integer;

  constructor(scene: BattleScene, text: string, callbackDelay?: integer, prompt?: boolean, promptDelay?: integer) {
    super(scene);

    this.text = text;
    this.callbackDelay = callbackDelay;
    this.prompt = prompt;
    this.promptDelay = promptDelay;
  }

  start() {
    super.start();

    if (this.text.indexOf('$') > -1) {
      const pageIndex = this.text.indexOf('$');
      this.scene.unshiftPhase(new MessagePhase(this.scene, this.text.slice(pageIndex + 1), this.callbackDelay, this.prompt, this.promptDelay));
      this.text = this.text.slice(0, pageIndex).trim();
    }

    this.scene.ui.showText(this.text, null, () => this.end(), this.callbackDelay || (this.prompt ? 0 : 1500), this.prompt, this.promptDelay);
  }

  end() {
    if (this.scene.abilityBar.shown)
      this.scene.abilityBar.hide();

    super.end();
  }
}

export class DamagePhase extends PokemonPhase {
  private amount: integer;
  private damageResult: DamageResult;
  private critical: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, amount: integer, damageResult?: DamageResult, critical: boolean = false) {
    super(scene, battlerIndex);

    this.amount = amount;
    this.damageResult = damageResult || HitResult.EFFECTIVE;
    this.critical = critical;
  }

  start() {
    super.start();

    if (this.damageResult === HitResult.ONE_HIT_KO) {
      this.scene.toggleInvert(true);
      this.scene.time.delayedCall(Utils.fixedInt(1000), () => {
        this.scene.toggleInvert(false);
        this.applyDamage();
      });
      return;
    }

    this.applyDamage();
  }

  updateAmount(amount: integer): void {
    this.amount = amount;
  }

  applyDamage() {
    switch (this.damageResult) {
      case HitResult.EFFECTIVE:
        this.scene.playSound('hit');
        break;
      case HitResult.SUPER_EFFECTIVE:
      case HitResult.ONE_HIT_KO:
        this.scene.playSound('hit_strong');
        break;
      case HitResult.NOT_VERY_EFFECTIVE:
        this.scene.playSound('hit_weak');
        break;
    }

    if (this.amount)
      this.scene.damageNumberHandler.add(this.getPokemon(), this.amount, this.damageResult, this.critical);

    if (this.damageResult !== HitResult.OTHER) {
      const flashTimer = this.scene.time.addEvent({
        delay: 100,
        repeat: 5,
        startAt: 200,
        callback: () => {
          this.getPokemon().getSprite().setVisible(flashTimer.repeatCount % 2 === 0);
          if (!flashTimer.repeatCount)
            this.getPokemon().updateInfo().then(() => this.end());
        }
      });
    } else
      this.getPokemon().updateInfo().then(() => this.end());
  }

  end() {
    switch (this.scene.currentBattle.battleSpec) {
      case BattleSpec.FINAL_BOSS:
        const pokemon = this.getPokemon();
        if (pokemon instanceof EnemyPokemon && pokemon.isBoss() && !pokemon.formIndex && pokemon.bossSegmentIndex < 1) {
          this.scene.fadeOutBgm(Utils.fixedInt(2000), false);
          this.scene.ui.showDialogue(battleSpecDialogue[BattleSpec.FINAL_BOSS].firstStageWin, pokemon.species.name, null, () => {
            this.scene.addEnemyModifier(getModifierType(modifierTypes.MINI_BLACK_HOLE).newModifier(pokemon) as PersistentModifier, false, true);
            pokemon.generateAndPopulateMoveset(1);
            this.scene.setFieldScale(0.75);
            this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeManualTrigger, false);
            this.scene.currentBattle.double = true;
            const availablePartyMembers = this.scene.getParty().filter(p => !p.isFainted());
            if (availablePartyMembers.length > 1) {
              this.scene.pushPhase(new ToggleDoublePositionPhase(this.scene, true));
              if (!availablePartyMembers[1].isOnField())
                this.scene.pushPhase(new SummonPhase(this.scene, 1));
            }

            super.end();
          });
          return;
        }
        break;
    }

    super.end();
  }
}

export class FaintPhase extends PokemonPhase {
  private preventEndure: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, preventEndure?: boolean) {
    super(scene, battlerIndex);

    this.preventEndure = preventEndure;
  }

  start() {
    super.start();

    if (!this.preventEndure) {
      const instantReviveModifier = this.scene.applyModifier(PokemonInstantReviveModifier, this.player, this.getPokemon()) as PokemonInstantReviveModifier;

      if (instantReviveModifier) {
        if (!--instantReviveModifier.stackCount)
          this.scene.removeModifier(instantReviveModifier);
        this.scene.updateModifiers(this.player);
        return this.end();
      }
    }

    if (!this.tryOverrideForBattleSpec())
      this.doFaint();
  }

  doFaint(): void {
    const pokemon = this.getPokemon();

    this.scene.queueMessage(getPokemonMessage(pokemon, ' fainted!'), null, true);

    if (pokemon.turnData?.attacksReceived?.length) {
      const lastAttack = pokemon.turnData.attacksReceived[0];
      applyPostFaintAbAttrs(PostFaintAbAttr, pokemon, this.scene.getPokemonById(lastAttack.sourceId), new PokemonMove(lastAttack.move), lastAttack.result);
    }

    const alivePlayField = this.scene.getField(true);
    alivePlayField.forEach(p => applyPostKnockOutAbAttrs(PostKnockOutAbAttr, p, pokemon));
    if (pokemon.turnData?.attacksReceived?.length) {
      const defeatSource = this.scene.getPokemonById(pokemon.turnData.attacksReceived[0].sourceId);
      if (defeatSource?.isOnField())
        applyPostVictoryAbAttrs(PostVictoryAbAttr, defeatSource);
    }

    if (this.player) {
      const nonFaintedPartyMembers = this.scene.getParty().filter(p => !p.isFainted());
      const nonFaintedPartyMemberCount = nonFaintedPartyMembers.length;
      if (!nonFaintedPartyMemberCount)
        this.scene.unshiftPhase(new GameOverPhase(this.scene));
      else if (nonFaintedPartyMemberCount >= this.scene.currentBattle.getBattlerCount() || (this.scene.currentBattle.double && !nonFaintedPartyMembers[0].isActive(true)))
        this.scene.pushPhase(new SwitchPhase(this.scene, this.fieldIndex, true, false));
      if (nonFaintedPartyMemberCount === 1 && this.scene.currentBattle.double)
        this.scene.unshiftPhase(new ToggleDoublePositionPhase(this.scene, true));
    } else {
      this.scene.unshiftPhase(new VictoryPhase(this.scene, this.battlerIndex));
      if (this.scene.currentBattle.battleType === BattleType.TRAINER) {
        const hasReservePartyMember = !!this.scene.getEnemyParty().filter(p => p.isActive() && !p.isOnField() && p.trainerSlot === (pokemon as EnemyPokemon).trainerSlot).length;
        if (hasReservePartyMember)
          this.scene.pushPhase(new SwitchSummonPhase(this.scene, this.fieldIndex, -1, false, false, false));
      }
    }

    if (this.scene.currentBattle.double) {
      const allyPokemon = pokemon.getAlly();
      if (allyPokemon?.isActive(true)) {
        let targetingMovePhase: MovePhase;
        do {
          targetingMovePhase = this.scene.findPhase(mp => mp instanceof MovePhase && mp.targets.length === 1 && mp.targets[0] === pokemon.getBattlerIndex() && mp.pokemon.isPlayer() !== allyPokemon.isPlayer()) as MovePhase;
          if (targetingMovePhase && targetingMovePhase.targets[0] !== allyPokemon.getBattlerIndex())
            targetingMovePhase.targets[0] = allyPokemon.getBattlerIndex();
        } while (targetingMovePhase);
      }
    }

    pokemon.lapseTags(BattlerTagLapseType.FAINT);
    this.scene.getField(true).filter(p => p !== pokemon).forEach(p => p.removeTagsBySourceId(pokemon.id));

    pokemon.faintCry(() => {
      const friendshipDecrease = new Utils.IntegerHolder(10);
      pokemon.friendship = Math.max(pokemon.friendship - friendshipDecrease.value, 0);
      pokemon.hideInfo();
      this.scene.playSound('faint');
      this.scene.tweens.add({
        targets: pokemon,
        duration: 500,
        y: pokemon.y + 150,
        ease: 'Sine.easeIn',
        onComplete: () => {
          pokemon.setVisible(false);
          pokemon.y -= 150;
          pokemon.trySetStatus(StatusEffect.FAINT);
          if (pokemon.isPlayer())
            this.scene.currentBattle.removeFaintedParticipant(pokemon as PlayerPokemon);
          else {
            this.scene.addFaintedEnemyScore(pokemon as EnemyPokemon);
            this.scene.currentBattle.addPostBattleLoot(pokemon as EnemyPokemon);
          }
          this.scene.field.remove(pokemon);
          this.end();
        }
      });
    });
  }

  tryOverrideForBattleSpec(): boolean {
    switch (this.scene.currentBattle.battleSpec) {
      case BattleSpec.FINAL_BOSS:
        if (!this.player) {
          const enemy = this.getPokemon();
          if (enemy.formIndex)
            this.scene.ui.showDialogue(battleSpecDialogue[BattleSpec.FINAL_BOSS].secondStageWin, enemy.species.name, null, () => this.doFaint());
          else {
            // Final boss' HP threshold has been bypassed; cancel faint and force check for 2nd phase
            enemy.hp++;
            this.scene.unshiftPhase(new DamagePhase(this.scene, enemy.getBattlerIndex(), 0, HitResult.OTHER));
            this.end();
          }
          return true;
        }
    }

    return false;
  }
}

export class VictoryPhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    super.start();

    this.scene.gameData.gameStats.pokemonDefeated++;

    const participantIds = this.scene.currentBattle.playerParticipantIds;
    const party = this.scene.getParty();
    const expShareModifier = this.scene.findModifier(m => m instanceof ExpShareModifier) as ExpShareModifier;
    const expBalanceModifier = this.scene.findModifier(m => m instanceof ExpBalanceModifier) as ExpBalanceModifier;
    const multipleParticipantExpBonusModifier = this.scene.findModifier(m => m instanceof MultipleParticipantExpBonusModifier) as MultipleParticipantExpBonusModifier;
    const expPartyMembers = party.filter(p => p.hp && p.level < this.scene.getMaxExpLevel());
    const partyMemberExp = [];

    if (participantIds.size) {
      let expValue = this.getPokemon().getExpValue();
      if (this.scene.currentBattle.battleType === BattleType.TRAINER)
        expValue = Math.floor(expValue * 1.5);
      for (let partyMember of expPartyMembers) {
        const pId = partyMember.id;
        const participated = participantIds.has(pId);
        if (participated) {
          const friendshipIncrease = new Utils.IntegerHolder(2);
          this.scene.applyModifier(PokemonFriendshipBoosterModifier, true, partyMember, friendshipIncrease);
          partyMember.friendship = Math.min(partyMember.friendship + friendshipIncrease.value, 255);
          if (partyMember.friendship === 255)
            this.scene.validateAchv(achvs.MAX_FRIENDSHIP);
        }
        else if (!expShareModifier) {
          partyMemberExp.push(0);
          continue;
        }
        let expMultiplier = 0;
        if (participated) {
          expMultiplier += (1 / participantIds.size);
          if (participantIds.size > 1 && multipleParticipantExpBonusModifier)
            expMultiplier += multipleParticipantExpBonusModifier.getStackCount() * 0.2;
        } else if (expShareModifier)
          expMultiplier += (expShareModifier.getStackCount() * 0.2) / participantIds.size;
        if (partyMember.pokerus)
          expMultiplier *= 1.5;
        const pokemonExp = new Utils.NumberHolder(expValue * expMultiplier);
        this.scene.applyModifiers(PokemonExpBoosterModifier, true, partyMember, pokemonExp);
        partyMemberExp.push(Math.floor(pokemonExp.value));
      }

      if (expBalanceModifier) {
        let totalLevel = 0;
        let totalExp = 0;
        expPartyMembers.forEach((expPartyMember, epm) => {
          totalExp += partyMemberExp[epm];
          totalLevel += expPartyMember.level;
        });

        const medianLevel = Math.floor(totalLevel / expPartyMembers.length);

        const recipientExpPartyMemberIndexes = [];
        expPartyMembers.forEach((expPartyMember, epm) => {
          if (expPartyMember.level <= medianLevel)
            recipientExpPartyMemberIndexes.push(epm);
        });

        const splitExp = Math.floor(totalExp / recipientExpPartyMemberIndexes.length);

        expPartyMembers.forEach((_partyMember, pm) => {
          partyMemberExp[pm] = Phaser.Math.Linear(partyMemberExp[pm], recipientExpPartyMemberIndexes.indexOf(pm) > -1 ? splitExp : 0, 0.2 * expBalanceModifier.getStackCount());
        });
      }

      for (let pm = 0; pm < expPartyMembers.length; pm++) {
        const exp = partyMemberExp[pm];

        if (exp) {
          const partyMemberIndex = party.indexOf(expPartyMembers[pm]);
          this.scene.unshiftPhase(expPartyMembers[pm].isOnField() ? new ExpPhase(this.scene, partyMemberIndex, exp) : new ShowPartyExpBarPhase(this.scene, partyMemberIndex, exp));
        }
      }
    }
  
    if (!this.scene.getEnemyParty().find(p => this.scene.currentBattle.battleType ? !p?.isFainted(true) : p.isOnField())) {
      this.scene.pushPhase(new BattleEndPhase(this.scene));
      if (this.scene.currentBattle.battleType === BattleType.TRAINER)
        this.scene.pushPhase(new TrainerVictoryPhase(this.scene));
      this.scene.pushPhase(new EggLapsePhase(this.scene));
      if (this.scene.gameMode.isEndless || !this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex)) {
        if (this.scene.currentBattle.waveIndex % 10)
          this.scene.pushPhase(new SelectModifierPhase(this.scene));
        else if (this.scene.gameMode.isDaily) {
          this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.EXP_CHARM));
          if (this.scene.currentBattle.waveIndex > 10 && !this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex))
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.GOLDEN_POKEBALL));
        } else {
          const superExpWave = !this.scene.gameMode.isEndless ? (this.scene.offsetGym ? 0 : 20) : 10;
          if (this.scene.gameMode.isEndless && this.scene.currentBattle.waveIndex === 10)
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.EXP_SHARE));
          if (this.scene.currentBattle.waveIndex <= 750 && (this.scene.currentBattle.waveIndex <= 500 || (this.scene.currentBattle.waveIndex % 30) === superExpWave))
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, (this.scene.currentBattle.waveIndex % 30) !== superExpWave || this.scene.currentBattle.waveIndex > 250 ? modifierTypes.EXP_CHARM : modifierTypes.SUPER_EXP_CHARM));
          if (this.scene.currentBattle.waveIndex <= 150 && !(this.scene.currentBattle.waveIndex % 50))
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.GOLDEN_POKEBALL));
          if (this.scene.gameMode.isEndless && !(this.scene.currentBattle.waveIndex % 50)) {
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, !(this.scene.currentBattle.waveIndex % 250) ? modifierTypes.VOUCHER_PREMIUM : modifierTypes.VOUCHER_PLUS));
            this.scene.pushPhase(new AddEnemyBuffModifierPhase(this.scene));
          }
        }
        this.scene.pushPhase(new NewBattlePhase(this.scene));
      } else {
        this.scene.currentBattle.battleType = BattleType.CLEAR;
        this.scene.score += this.scene.gameMode.getClearScoreBonus();
        this.scene.updateScoreText();
        this.scene.pushPhase(new GameOverPhase(this.scene, true));
      }
    }

    this.end();
  }
}

export class TrainerVictoryPhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    this.scene.playBgm(this.scene.currentBattle.trainer.config.victoryBgm);

    this.scene.unshiftPhase(new MoneyRewardPhase(this.scene, this.scene.currentBattle.trainer.config.moneyMultiplier));

    const modifierRewardFuncs = this.scene.currentBattle.trainer.config.modifierRewardFuncs;
    for (let modifierRewardFunc of modifierRewardFuncs)
      this.scene.unshiftPhase(new ModifierRewardPhase(this.scene, modifierRewardFunc));

    const trainerType = this.scene.currentBattle.trainer.config.trainerType;
    if (vouchers.hasOwnProperty(TrainerType[trainerType])) {
      if (!this.scene.validateVoucher(vouchers[TrainerType[trainerType]]) && this.scene.currentBattle.trainer.config.isBoss)
        this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.VOUCHER));
    }

    this.scene.ui.showText(`You defeated\n${this.scene.currentBattle.trainer.getName(TrainerSlot.NONE, true)}!`, null, () => {
      const victoryMessages = this.scene.currentBattle.trainer.getVictoryMessages();
      const showMessage = () => {
        let message: string;
        this.scene.executeWithSeedOffset(() => message = Utils.randSeedItem(victoryMessages), this.scene.currentBattle.waveIndex);
        const messagePages = message.split(/\$/g).map(m => m.trim());
      
        for (let p = messagePages.length - 1; p >= 0; p--) {
          const originalFunc = showMessageOrEnd;
          showMessageOrEnd = () => this.scene.ui.showDialogue(messagePages[p], this.scene.currentBattle.trainer.getName(), null, originalFunc);
        }

        showMessageOrEnd();
      };
      let showMessageOrEnd = () => this.end();
      if (victoryMessages?.length) {
        if (this.scene.currentBattle.trainer.config.hasCharSprite) {
          const originalFunc = showMessageOrEnd;
          showMessageOrEnd = () => this.scene.charSprite.hide().then(() => this.scene.hideFieldOverlay(250).then(() => originalFunc()));
          this.scene.showFieldOverlay(500).then(() => this.scene.charSprite.showCharacter(this.scene.currentBattle.trainer.getKey(), getCharVariantFromDialogue(victoryMessages[0])).then(() => showMessage()));
        } else
          showMessage();
      } else
        showMessageOrEnd();
    }, null, true);

    this.showEnemyTrainer();
  }
}

export class MoneyRewardPhase extends BattlePhase {
  private moneyMultiplier: number;

  constructor(scene: BattleScene, moneyMultiplier: number) {
    super(scene);

    this.moneyMultiplier = moneyMultiplier;
  }

  start() {
    const moneyAmount = new Utils.IntegerHolder(this.scene.getWaveMoneyAmount(this.moneyMultiplier));

    this.scene.applyModifiers(MoneyMultiplierModifier, true, moneyAmount);

    this.scene.money += moneyAmount.value;
    this.scene.updateMoneyText();

    this.scene.validateAchvs(MoneyAchv);

    this.scene.ui.showText(`You got ₽${moneyAmount.value.toLocaleString('en-US')}\nfor winning!`, null, () => this.end(), null, true);
  }
}

export class ModifierRewardPhase extends BattlePhase {
  protected modifierType: ModifierType;

  constructor(scene: BattleScene, modifierTypeFunc: ModifierTypeFunc) {
    super(scene);

    this.modifierType = getModifierType(modifierTypeFunc);
  }

  start() {
    super.start();

    this.doReward().then(() => this.end());
  }

  doReward(): Promise<void> {
    return new Promise<void>(resolve => {
      const newModifier = this.modifierType.newModifier();
      this.scene.addModifier(newModifier).then(() => {
        this.scene.playSound('item_fanfare');
        this.scene.ui.showText(`You received\n${newModifier.type.name}!`, null, () => resolve(), null, true);
      });
    })
  }
}

export class GameOverModifierRewardPhase extends ModifierRewardPhase {
  constructor(scene: BattleScene, modifierTypeFunc: ModifierTypeFunc) {
    super(scene, modifierTypeFunc);
  }

  doReward(): Promise<void> {
    return new Promise<void>(resolve => {
      const newModifier = this.modifierType.newModifier();
      this.scene.addModifier(newModifier).then(() => {
        this.scene.gameData.saveSystem().then(success => {
          if (success) {
            this.scene.playSound('level_up_fanfare');
            this.scene.ui.setMode(Mode.MESSAGE);
            this.scene.arenaBg.setVisible(false);
            this.scene.ui.fadeIn(250).then(() => {
              this.scene.ui.showText(`You received\n${newModifier.type.name}!`, null, () => {
                this.scene.time.delayedCall(1500, () => this.scene.arenaBg.setVisible(true));
                resolve();
              }, null, true, 1500);
            });
          } else
            this.scene.reset(true);
        });
      });
    })
  }
}

export class GameOverPhase extends BattlePhase {
  private victory: boolean;

  constructor(scene: BattleScene, victory?: boolean) {
    super(scene);

    this.victory = !!victory;
  }

  start() {
    super.start();

    if (this.victory || !this.scene.enableRetries)
      this.handleClearSession();
    else {
      this.scene.ui.showText(`Would you like to retry from the start of the battle?`, null, () => {
        this.scene.ui.setMode(Mode.CONFIRM, () => {
          this.scene.ui.fadeOut(1250).then(() => {
          this.scene.reset();
            this.scene.clearPhaseQueue();
            this.scene.gameData.loadSession(this.scene, this.scene.sessionSlotId).then(() => {
              this.scene.pushPhase(new EncounterPhase(this.scene, true));

              const availablePartyMembers = this.scene.getParty().filter(p => !p.isFainted()).length;
    
              this.scene.pushPhase(new SummonPhase(this.scene, 0));
              if (this.scene.currentBattle.double && availablePartyMembers > 1)
                this.scene.pushPhase(new SummonPhase(this.scene, 1));
              if (this.scene.currentBattle.waveIndex > 1 && this.scene.currentBattle.battleType !== BattleType.TRAINER) {
                this.scene.pushPhase(new CheckSwitchPhase(this.scene, 0, this.scene.currentBattle.double));
                if (this.scene.currentBattle.double && availablePartyMembers > 1)
                  this.scene.pushPhase(new CheckSwitchPhase(this.scene, 1, this.scene.currentBattle.double));
              }

              this.scene.ui.fadeIn(1250);
              this.end();
            });
          });
        }, () => this.handleClearSession(), false, 0, 0, 1000);
      });
    }
  }

  handleClearSession(): void {
    this.scene.gameData.tryClearSession(this.scene, this.scene.sessionSlotId).then((success: boolean | [boolean, boolean]) => {
      this.scene.time.delayedCall(1000, () => {
        let firstClear = false;
        if (this.victory && success[1]) {
          if (this.scene.gameMode.isClassic) {
            firstClear = this.scene.validateAchv(achvs.CLASSIC_VICTORY);
            this.scene.gameData.gameStats.sessionsWon++;
          } else if (this.scene.gameMode.isDaily && success[1])
            this.scene.gameData.gameStats.dailyRunSessionsWon++;
        }
        this.scene.gameData.saveSystem();
        const fadeDuration = this.victory ? 10000 : 5000;
        this.scene.fadeOutBgm(fadeDuration, true);
        this.scene.ui.fadeOut(fadeDuration).then(() => {
          this.scene.setFieldScale(1, true);
          this.scene.clearPhaseQueue();
          this.scene.ui.clearText();
          this.handleUnlocks();
          if (this.victory && !firstClear && success[1])
            this.scene.unshiftPhase(new GameOverModifierRewardPhase(this.scene, modifierTypes.VOUCHER_PREMIUM));
          this.scene.reset();
          this.scene.unshiftPhase(new TitlePhase(this.scene));
          this.end();
        });
      });
    });
  }

  handleUnlocks(): void {
    if (this.victory && this.scene.gameMode.isClassic) {
      if (!this.scene.gameData.unlocks[Unlockables.ENDLESS_MODE])
        this.scene.unshiftPhase(new UnlockPhase(this.scene, Unlockables.ENDLESS_MODE));
      if (this.scene.getParty().filter(p => p.fusionSpecies).length && !this.scene.gameData.unlocks[Unlockables.SPLICED_ENDLESS_MODE])
        this.scene.unshiftPhase(new UnlockPhase(this.scene, Unlockables.SPLICED_ENDLESS_MODE));
      if (!this.scene.gameData.unlocks[Unlockables.MINI_BLACK_HOLE])
        this.scene.unshiftPhase(new UnlockPhase(this.scene, Unlockables.MINI_BLACK_HOLE));
    }
  }
}

export class UnlockPhase extends Phase {
  private unlockable: Unlockables;

  constructor(scene: BattleScene, unlockable: Unlockables) {
    super(scene);

    this.unlockable = unlockable;
  }

  start(): void {
    this.scene.time.delayedCall(2000, () => {
      this.scene.gameData.unlocks[this.unlockable] = true;
      this.scene.gameData.saveSystem().then(success => {
        if (success) {
          this.scene.playSound('level_up_fanfare');
          this.scene.ui.setMode(Mode.MESSAGE);
          this.scene.arenaBg.setVisible(false);
          this.scene.ui.fadeIn(250).then(() => {
            this.scene.ui.showText(`${getUnlockableName(this.unlockable)}\nhas been unlocked.`, null, () => {
              this.scene.time.delayedCall(1500, () => this.scene.arenaBg.setVisible(true));
              this.end();
            }, null, true, 1500);
          });
        } else
          this.scene.reset(true);
      });
    });
  }
}

export class SwitchPhase extends BattlePhase {
  protected fieldIndex: integer;
  private isModal: boolean;
  private doReturn: boolean;

  constructor(scene: BattleScene, fieldIndex: integer, isModal: boolean, doReturn: boolean) {
    super(scene);

    this.fieldIndex = fieldIndex;
    this.isModal = isModal;
    this.doReturn = doReturn;
  }

  start() {
    super.start();

    // Skip modal switch if impossible
    if (this.isModal && !this.scene.getParty().filter(p => !p.isFainted() && !p.isActive(true)).length)
      return super.end();

    // Override field index to 0 in case of double battle where 2/3 remaining party members fainted at once
    const fieldIndex = this.scene.currentBattle.getBattlerCount() === 1 || this.scene.getParty().filter(p => !p.isFainted()).length > 1 ? this.fieldIndex : 0;

    this.scene.ui.setMode(Mode.PARTY, this.isModal ? PartyUiMode.FAINT_SWITCH : PartyUiMode.POST_BATTLE_SWITCH, fieldIndex, (slotIndex: integer, option: PartyOption) => {
      if (slotIndex >= this.scene.currentBattle.getBattlerCount() && slotIndex < 6)
        this.scene.unshiftPhase(new SwitchSummonPhase(this.scene, fieldIndex, slotIndex, this.doReturn, option === PartyOption.PASS_BATON));
      this.scene.ui.setMode(Mode.MESSAGE).then(() => super.end());
    }, PartyUiHandler.FilterNonFainted);
  }
}

export class ExpPhase extends PlayerPartyMemberPokemonPhase {
  private expValue: number;

  constructor(scene: BattleScene, partyMemberIndex: integer, expValue: number) {
    super(scene, partyMemberIndex);

    this.expValue = expValue;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    let exp = new Utils.NumberHolder(this.expValue);
    this.scene.applyModifiers(ExpBoosterModifier, true, exp);
    exp.value = Math.floor(exp.value);
    this.scene.ui.showText(`${pokemon.name} gained\n${exp.value} EXP. Points!`, null, () => {
      const lastLevel = pokemon.level;
      let newLevel: integer;
      pokemon.addExp(exp.value);
      newLevel = pokemon.level;
      if (newLevel > lastLevel)
        this.scene.unshiftPhase(new LevelUpPhase(this.scene, this.partyMemberIndex, lastLevel, newLevel));
      pokemon.updateInfo().then(() => this.end());
    }, null, true);
  }
}

export class ShowPartyExpBarPhase extends PlayerPartyMemberPokemonPhase {
  private expValue: number;

  constructor(scene: BattleScene, partyMemberIndex: integer, expValue: number) {
    super(scene, partyMemberIndex);

    this.expValue = expValue;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    let exp = new Utils.NumberHolder(this.expValue);
    this.scene.applyModifiers(ExpBoosterModifier, true, exp);
    exp.value = Math.floor(exp.value);

    const lastLevel = pokemon.level;
    let newLevel: integer;
    pokemon.addExp(exp.value);
    newLevel = pokemon.level;
    if (newLevel > lastLevel)
      this.scene.unshiftPhase(new LevelUpPhase(this.scene, this.partyMemberIndex, lastLevel, newLevel));
    this.scene.unshiftPhase(new HidePartyExpBarPhase(this.scene));
    pokemon.updateInfo();

    this.scene.partyExpBar.showPokemonExp(pokemon, exp.value).then(() => {
      if (newLevel > lastLevel)
        this.end();
      else
        setTimeout(() => this.end(), 500);
    });
  }
}

export class HidePartyExpBarPhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.partyExpBar.hide().then(() => this.end());
  }
}

export class LevelUpPhase extends PlayerPartyMemberPokemonPhase {
  private lastLevel: integer;
  private level: integer;

  constructor(scene: BattleScene, partyMemberIndex: integer, lastLevel: integer, level: integer) {
    super(scene, partyMemberIndex);

    this.lastLevel = lastLevel;
    this.level = level;
  }

  start() {
    super.start();

    if (this.level > this.scene.gameData.gameStats.highestLevel)
      this.scene.gameData.gameStats.highestLevel = this.level;

    this.scene.validateAchvs(LevelAchv, new Utils.IntegerHolder(this.level));

    const pokemon = this.getPokemon();
    const prevStats = pokemon.stats.slice(0);
    pokemon.calculateStats();
    pokemon.updateInfo();
    this.scene.playSound('level_up_fanfare');
    this.scene.ui.showText(`${this.getPokemon().name} grew to\nLv. ${this.level}!`, null, () => this.scene.ui.getMessageHandler().promptLevelUpStats(this.partyMemberIndex, prevStats, false).then(() => this.end()), null, true);
    if (this.level <= 100) {
      const levelMoves = this.getPokemon().getLevelMoves(this.lastLevel + 1);
      for (let lm of levelMoves)
        this.scene.unshiftPhase(new LearnMovePhase(this.scene, this.partyMemberIndex, lm[1]));
    }
    if (!pokemon.pauseEvolutions) {
      const evolution = pokemon.getEvolution();
      if (evolution)
        this.scene.unshiftPhase(new EvolutionPhase(this.scene, pokemon as PlayerPokemon, evolution, this.lastLevel));
    }
  }
}

export class LearnMovePhase extends PlayerPartyMemberPokemonPhase {
  private moveId: Moves;

  constructor(scene: BattleScene, partyMemberIndex: integer, moveId: Moves) {
    super(scene, partyMemberIndex);

    this.moveId = moveId;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    const move = allMoves[this.moveId];

    const existingMoveIndex = pokemon.getMoveset().findIndex(m => m?.moveId === move.id);

    if (existingMoveIndex > -1)
      return this.end();

    const emptyMoveIndex = pokemon.getMoveset().length < 4
      ? pokemon.getMoveset().length
      : pokemon.getMoveset().findIndex(m => m === null);

    const messageMode = this.scene.ui.getHandler() instanceof EvolutionSceneHandler
      ? Mode.EVOLUTION_SCENE
      : Mode.MESSAGE;

    if (emptyMoveIndex > -1) {
      pokemon.setMove(emptyMoveIndex, this.moveId);
      initMoveAnim(this.moveId).then(() => {
        loadMoveAnimAssets(this.scene, [ this.moveId ], true)
          .then(() => {
            this.scene.ui.setMode(messageMode).then(() => {
              this.scene.playSound('level_up_fanfare');
              this.scene.ui.showText(`${pokemon.name} learned\n${move.name}!`, null, () => {
                this.scene.triggerPokemonFormChange(pokemon, SpeciesFormChangeMoveLearnedTrigger, true);
                this.end();
              }, messageMode === Mode.EVOLUTION_SCENE ? 1000 : null, true);
            });
          });
        });
    } else {
      this.scene.ui.setMode(messageMode).then(() => {
        this.scene.ui.showText(`${pokemon.name} wants to learn the\nmove ${move.name}.`, null, () => {
          this.scene.ui.showText(`However, ${pokemon.name} already\nknows four moves.`, null, () => {
            this.scene.ui.showText(`Should a move be deleted and\nreplaced with ${move.name}?`, null, () => {
              const noHandler = () => {
                this.scene.ui.setMode(messageMode).then(() => {
                  this.scene.ui.showText(`Stop trying to teach\n${move.name}?`, null, () => {
                    this.scene.ui.setModeWithoutClear(Mode.CONFIRM, () => {
                      this.scene.ui.setMode(messageMode);
                      this.scene.ui.showText(`${pokemon.name} did not learn the\nmove ${move.name}.`, null, () => this.end(), null, true);
                    }, () => {
                      this.scene.ui.setMode(messageMode);
                      this.scene.unshiftPhase(new LearnMovePhase(this.scene, this.partyMemberIndex, this.moveId));
                      this.end();
                    });
                  });
                });
              };
              this.scene.ui.setModeWithoutClear(Mode.CONFIRM, () => {
                this.scene.ui.setMode(messageMode);
                this.scene.ui.showText('Which move should be forgotten?', null, () => {
                  this.scene.ui.setModeWithoutClear(Mode.SUMMARY, this.getPokemon(), SummaryUiMode.LEARN_MOVE, move, (moveIndex: integer) => {
                    if (moveIndex === 4) {
                      noHandler();
                      return;
                    }
                    this.scene.ui.setMode(messageMode).then(() => {
                      this.scene.ui.showText('@d{32}1, @d{15}2, and@d{15}… @d{15}… @d{15}… @d{15}@s{pb_bounce_1}Poof!', null, () => {
                        this.scene.ui.showText(`${pokemon.name} forgot how to\nuse ${pokemon.moveset[moveIndex].getName()}.`, null, () => {
                          this.scene.ui.showText('And…', null, () => {
                            pokemon.setMove(moveIndex, Moves.NONE);
                            this.scene.unshiftPhase(new LearnMovePhase(this.scene, this.partyMemberIndex, this.moveId));
                            this.end();
                          }, null, true);
                        }, null, true);
                      }, null, true);
                    });
                  });
                }, null, true);
              }, noHandler);
            });
          }, null, true);
        }, null, true);
      });
    }
  }
}

export class BerryPhase extends CommonAnimPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex, undefined, CommonAnim.USE_ITEM);
  }

  start() {
    let berryModifiers: BerryModifier[];

    if ((berryModifiers = this.scene.applyModifiers(BerryModifier, this.player, this.getPokemon()) as BerryModifier[])) {
      for (let berryModifier of berryModifiers) {
        if (berryModifier.consumed) {
          if (!--berryModifier.stackCount)
            this.scene.removeModifier(berryModifier);
          else
            berryModifier.consumed = false;
          this.scene.updateModifiers(this.player);
        }
      }
      return super.start();
    }

    this.end();
  }
}

export class PokemonHealPhase extends CommonAnimPhase {
  private hpHealed: integer;
  private message: string;
  private showFullHpMessage: boolean;
  private skipAnim: boolean;
  private revive: boolean;
  private healStatus: boolean;
  private preventFullHeal: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, hpHealed: integer, message: string, showFullHpMessage: boolean, skipAnim: boolean = false, revive: boolean = false, healStatus: boolean = false, preventFullHeal: boolean = false) {
    super(scene, battlerIndex, undefined, CommonAnim.HEALTH_UP);

    this.hpHealed = hpHealed;
    this.message = message;
    this.showFullHpMessage = showFullHpMessage;
    this.skipAnim = skipAnim;
    this.revive = revive;
    this.healStatus = healStatus;
    this.preventFullHeal = preventFullHeal;
  }

  start() {
    if (!this.skipAnim && (this.revive || this.getPokemon().hp) && this.getPokemon().getHpRatio() < 1)
      super.start();
    else
      this.end();
  }

  end() {
    const pokemon = this.getPokemon();
    
    if (!pokemon.isOnField() || (!this.revive && !pokemon.isActive())) {
      super.end();
      return;
    }

    const fullHp = pokemon.getHpRatio() >= 1;

    const hasMessage = !!this.message;
    let lastStatusEffect = StatusEffect.NONE;

    if (!fullHp) {
      const hpRestoreMultiplier = new Utils.IntegerHolder(1);
      if (!this.revive)
        this.scene.applyModifiers(HealingBoosterModifier, this.player, hpRestoreMultiplier);
      const healAmount = new Utils.NumberHolder(Math.floor(this.hpHealed * hpRestoreMultiplier.value));
      // Prevent healing to full if specified (in case of healing tokens so Sturdy doesn't cause a softlock)
      if (this.preventFullHeal && pokemon.hp + healAmount.value >= pokemon.getMaxHp())
        healAmount.value = (pokemon.getMaxHp() - pokemon.hp) - 1;
      healAmount.value = pokemon.heal(healAmount.value);
      if (healAmount.value)
        this.scene.damageNumberHandler.add(pokemon, healAmount.value, HitResult.HEAL);
      if (pokemon.isPlayer()) {
        this.scene.validateAchvs(HealAchv, healAmount);
        if (healAmount.value > this.scene.gameData.gameStats.highestHeal)
          this.scene.gameData.gameStats.highestHeal = healAmount.value;
      }
      if (this.healStatus && !this.revive && pokemon.status) {
        lastStatusEffect = pokemon.status.effect;
        pokemon.resetStatus();
      }
      pokemon.updateInfo().then(() => super.end());
    } else if (this.healStatus && !this.revive && pokemon.status) {
        lastStatusEffect = pokemon.status.effect;
        pokemon.resetStatus();
        pokemon.updateInfo().then(() => super.end());
    } else if (this.showFullHpMessage)
      this.message = getPokemonMessage(pokemon, `'s\nHP is full!`);

    if (this.message)
      this.scene.queueMessage(this.message);

    if (this.healStatus && lastStatusEffect && !hasMessage)
      this.scene.queueMessage(getPokemonMessage(pokemon, getStatusEffectHealText(lastStatusEffect)));

    if (fullHp && !lastStatusEffect)
      super.end();
  }
}

export class AttemptCapturePhase extends PokemonPhase {
  private pokeballType: PokeballType;
  private pokeball: Phaser.GameObjects.Sprite;
  private originalY: number;

  constructor(scene: BattleScene, targetIndex: integer, pokeballType: PokeballType) {
    super(scene, BattlerIndex.ENEMY + targetIndex);

    this.pokeballType = pokeballType;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon() as EnemyPokemon;

    if (!pokemon?.hp)
      return this.end();

    this.scene.pokeballCounts[this.pokeballType]--;

    this.originalY = pokemon.y;

    const _3m = 3 * pokemon.getMaxHp();
    const _2h = 2 * pokemon.hp;
    const catchRate = pokemon.species.catchRate;
    const pokeballMultiplier = getPokeballCatchMultiplier(this.pokeballType);
    const statusMultiplier = pokemon.status ? getStatusEffectCatchRateMultiplier(pokemon.status.effect) : 1;
    const x = Math.round((((_3m - _2h) * catchRate * pokeballMultiplier) / _3m) * statusMultiplier);
    const y = Math.round(65536 / Math.sqrt(Math.sqrt(255 / x)));
    const fpOffset = pokemon.getFieldPositionOffset();

    const pokeballAtlasKey = getPokeballAtlasKey(this.pokeballType);
    this.pokeball = this.scene.addFieldSprite(16, 80, 'pb', pokeballAtlasKey);
    this.pokeball.setOrigin(0.5, 0.625);
    this.scene.field.add(this.pokeball);

    this.scene.playSound('pb_throw');
    this.scene.time.delayedCall(300, () => {
      this.scene.field.moveBelow(this.pokeball as Phaser.GameObjects.GameObject, pokemon);
    });

    this.scene.tweens.add({
      targets: this.pokeball,
      x: { value: 236 + fpOffset[0], ease: 'Linear' },
      y: { value: 16 + fpOffset[1], ease: 'Cubic.easeOut' },
      duration: 500,
      onComplete: () => {
        this.pokeball.setTexture('pb', `${pokeballAtlasKey}_opening`);
        this.scene.time.delayedCall(17, () => this.pokeball.setTexture('pb', `${pokeballAtlasKey}_open`));
        this.scene.playSound('pb_rel');
        pokemon.tint(getPokeballTintColor(this.pokeballType));

        addPokeballOpenParticles(this.scene, this.pokeball.x, this.pokeball.y, this.pokeballType);

        this.scene.tweens.add({
          targets: pokemon,
          duration: 500,
          ease: 'Sine.easeIn',
          scale: 0.25,
          y: 20,
          onComplete: () => {
            this.pokeball.setTexture('pb', `${pokeballAtlasKey}_opening`);
            pokemon.setVisible(false);
            this.scene.playSound('pb_catch');
            this.scene.time.delayedCall(17, () => this.pokeball.setTexture('pb', `${pokeballAtlasKey}`));

            const doShake = () => {
              let shakeCount = 0;
              const pbX = this.pokeball.x;
              const shakeCounter = this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                repeat: 4,
                yoyo: true,
                ease: 'Cubic.easeOut',
                duration: 250,
                repeatDelay: 500,
                onUpdate: t => {
                  if (shakeCount && shakeCount < 4) {
                    const value = t.getValue();
                    const directionMultiplier = shakeCount % 2 === 1 ? 1 : -1;
                    this.pokeball.setX(pbX + value * 4 * directionMultiplier);
                    this.pokeball.setAngle(value * 27.5 * directionMultiplier);
                  }
                },
                onRepeat: () => {
                  if (!pokemon.species.isObtainable()) {
                    shakeCounter.stop();
                    this.failCatch(shakeCount);
                  } else if (shakeCount++ < 3) {
                    if (pokeballMultiplier === -1 || pokemon.randSeedInt(65536) < y)
                      this.scene.playSound('pb_move');
                    else {
                      shakeCounter.stop();
                      this.failCatch(shakeCount);
                    }
                  } else {
                    this.scene.playSound('pb_lock');
                    addPokeballCaptureStars(this.scene, this.pokeball);
                    
                    const pbTint = this.scene.add.sprite(this.pokeball.x, this.pokeball.y, 'pb', 'pb');
                    pbTint.setOrigin(this.pokeball.originX, this.pokeball.originY);
                    pbTint.setTintFill(0);
                    pbTint.setAlpha(0);
                    this.scene.field.add(pbTint);
                    this.scene.tweens.add({
                      targets: pbTint,
                      alpha: 0.375,
                      duration: 200,
                      easing: 'Sine.easeOut',
                      onComplete: () => {
                        this.scene.tweens.add({
                          targets: pbTint,
                          alpha: 0,
                          duration: 200,
                          easing: 'Sine.easeIn',
                          onComplete: () => pbTint.destroy()
                        });
                      }
                    });
                  }
                },
                onComplete: () => this.catch()
              });
            };

            this.scene.time.delayedCall(250, () => doPokeballBounceAnim(this.scene, this.pokeball, 16, 72, 350, doShake));
          }
        });
      }
    });
  }

  failCatch(shakeCount: integer) {
    const pokemon = this.getPokemon();

    this.scene.playSound('pb_rel');
    pokemon.setY(this.originalY);
    if (pokemon.status?.effect !== StatusEffect.SLEEP)
      pokemon.cry(pokemon.getHpRatio() > 0.25 ? undefined : { rate: 0.85 });
    pokemon.tint(getPokeballTintColor(this.pokeballType));
    pokemon.setVisible(true);
    pokemon.untint(250, 'Sine.easeOut');

    const pokeballAtlasKey = getPokeballAtlasKey(this.pokeballType);
    this.pokeball.setTexture('pb', `${pokeballAtlasKey}_opening`);
    this.scene.time.delayedCall(17, () => this.pokeball.setTexture('pb', `${pokeballAtlasKey}_open`));

    this.scene.tweens.add({
      targets: pokemon,
      duration: 250,
      ease: 'Sine.easeOut',
      scale: 1
    });
    
    this.removePb();
    this.end();
  }

  catch() {
    const pokemon = this.getPokemon() as EnemyPokemon;
    this.scene.unshiftPhase(new VictoryPhase(this.scene, this.battlerIndex));

    const speciesForm = !pokemon.fusionSpecies ? pokemon.getSpeciesForm() : pokemon.getFusionSpeciesForm();

    if (speciesForm.abilityHidden && (pokemon.fusionSpecies ? pokemon.fusionAbilityIndex : pokemon.abilityIndex) === speciesForm.getAbilityCount() - 1)
      this.scene.validateAchv(achvs.HIDDEN_ABILITY);

    if (pokemon.species.pseudoLegendary || pokemon.species.legendary)
      this.scene.validateAchv(achvs.CATCH_LEGENDARY);

    if (pokemon.species.mythical)
      this.scene.validateAchv(achvs.CATCH_MYTHICAL);

    this.scene.pokemonInfoContainer.show(pokemon, true);

    this.scene.gameData.updateSpeciesDexIvs(pokemon.species.speciesId, pokemon.ivs);
      
    this.scene.ui.showText(`${pokemon.name} was caught!`, null, () => {
      const end = () => {
        this.scene.pokemonInfoContainer.hide();
        this.removePb();
        this.end();
      };
      const removePokemon = () => {
        this.scene.addFaintedEnemyScore(pokemon);
        this.scene.getPlayerField().filter(p => p.isActive(true)).forEach(playerPokemon => playerPokemon.removeTagsBySourceId(pokemon.id));
        pokemon.hp = 0;
        pokemon.trySetStatus(StatusEffect.FAINT);
        this.scene.clearEnemyHeldItemModifiers();
        this.scene.field.remove(pokemon, true);
      };
      const addToParty = () => {
        const newPokemon = pokemon.addToParty(this.pokeballType);
        const modifiers = this.scene.findModifiers(m => m instanceof PokemonHeldItemModifier, false);
        if (this.scene.getParty().filter(p => p.isShiny()).length === 6)
          this.scene.validateAchv(achvs.SHINY_PARTY);
        Promise.all(modifiers.map(m => this.scene.addModifier(m, true))).then(() => {
          this.scene.updateModifiers(true);
          removePokemon();
          if (newPokemon)
            newPokemon.loadAssets().then(end);
          else
            end();
        });
      };
      Promise.all([ pokemon.hideInfo(), this.scene.gameData.setPokemonCaught(pokemon) ]).then(() => {
        if (this.scene.getParty().length === 6) {
          const promptRelease = () => {
            this.scene.ui.showText(`Your party is full.\nRelease a Pokémon to make room for ${pokemon.name}?`, null, () => {
              this.scene.ui.setMode(Mode.CONFIRM, () => {
                this.scene.ui.setMode(Mode.PARTY, PartyUiMode.RELEASE, this.fieldIndex, (slotIndex: integer, _option: PartyOption) => {
                  this.scene.ui.setMode(Mode.MESSAGE).then(() => {
                    if (slotIndex < 6)
                      addToParty();
                    else
                      promptRelease();
                  });
                });
              }, () => {
                this.scene.ui.setMode(Mode.MESSAGE).then(() => {
                  removePokemon();
                  end();
                });
              });
            });
          };
          promptRelease();
        } else
          addToParty();
      });
    }, 0, true);
  }

  removePb() {
    this.scene.tweens.add({
      targets: this.pokeball,
      duration: 250,
      delay: 250,
      ease: 'Sine.easeIn',
      alpha: 0,
      onComplete: () => this.pokeball.destroy()
    });
  }
}

export class AttemptRunPhase extends PokemonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex);
  }

  start() {
    super.start();

    const playerPokemon = this.getPokemon();
    const enemyField = this.scene.getEnemyField();

    const enemySpeed = enemyField.reduce((total: integer, enemyPokemon: Pokemon) => total + enemyPokemon.getStat(Stat.SPD), 0) / enemyField.length;

    const escapeChance = new Utils.IntegerHolder((((playerPokemon.getStat(Stat.SPD) * 128) / enemySpeed) + (30 * this.scene.currentBattle.escapeAttempts++)) % 256);
    applyAbAttrs(RunSuccessAbAttr, playerPokemon, null, escapeChance);

    if (playerPokemon.randSeedInt(256) < escapeChance.value) {
      this.scene.playSound('flee');
      this.scene.queueMessage('You got away safely!', null, true, 500);
      
      this.scene.tweens.add({
        targets: [ this.scene.arenaEnemy, enemyField ].flat(),
        alpha: 0,
        duration: 250,
        ease: 'Sine.easeIn',
        onComplete: () => enemyField.forEach(enemyPokemon => enemyPokemon.destroy())
      });

      this.scene.clearEnemyHeldItemModifiers();

      enemyField.forEach(enemyPokemon => {
        enemyPokemon.hideInfo().then(() => enemyPokemon.destroy());
        enemyPokemon.hp = 0;
        enemyPokemon.trySetStatus(StatusEffect.FAINT);
      });

      this.scene.pushPhase(new BattleEndPhase(this.scene));
      this.scene.pushPhase(new NewBattlePhase(this.scene));
    } else
      this.scene.queueMessage('You can\'t escape!', null, true);

    this.end();
  }
}

export class SelectModifierPhase extends BattlePhase {
  private rerollCount: integer;
  private modifierTiers: ModifierTier[];

  constructor(scene: BattleScene, rerollCount: integer = 0, modifierTiers?: ModifierTier[]) {
    super(scene);

    this.rerollCount = rerollCount;
    this.modifierTiers = modifierTiers;
  }

  start() {
    super.start();

    if (!this.rerollCount)
      this.updateSeed();

    const party = this.scene.getParty();
    regenerateModifierPoolThresholds(party, this.getPoolType(), this.rerollCount);
    const modifierCount = new Utils.IntegerHolder(3);
    if (this.isPlayer())
      this.scene.applyModifiers(ExtraModifierModifier, true, modifierCount);
    const typeOptions: ModifierTypeOption[] = this.getModifierTypeOptions(modifierCount.value);

    const modifierSelectCallback = (rowCursor: integer, cursor: integer) => {
      if (rowCursor < 0 || cursor < 0) {
        this.scene.ui.showText(`Are you sure you want to skip taking an item?`, null, () => {
          this.scene.ui.setOverlayMode(Mode.CONFIRM, () => {
            this.scene.ui.revertMode();
            this.scene.ui.setMode(Mode.MESSAGE);
            super.end();
          }, () => this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers)));
        });
        return false;
      }
      let modifierType: ModifierType;
      let cost: integer;
      switch (rowCursor) {
        case 0:
          if (!cursor) {
            const rerollCost = this.getRerollCost(typeOptions, this.scene.lockModifierTiers);
            if (this.scene.money < rerollCost) {
              this.scene.ui.playError();
              return false;
            } else {
              this.scene.unshiftPhase(new SelectModifierPhase(this.scene, this.rerollCount + 1, typeOptions.map(o => o.type.tier)));
              this.scene.ui.clearText();
              this.scene.ui.setMode(Mode.MESSAGE).then(() => super.end());
              this.scene.money -= rerollCost;
              this.scene.updateMoneyText();
              this.scene.playSound('buy');
            }
          } else if (cursor === 1) {
            this.scene.ui.setModeWithoutClear(Mode.PARTY, PartyUiMode.MODIFIER_TRANSFER, -1, (fromSlotIndex: integer, itemIndex: integer, toSlotIndex: integer) => {
              if (toSlotIndex !== undefined && fromSlotIndex < 6 && toSlotIndex < 6 && fromSlotIndex !== toSlotIndex && itemIndex > -1) {
                this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers)).then(() => {
                  const itemModifiers = this.scene.findModifiers(m => m instanceof PokemonHeldItemModifier
                    && (m as PokemonHeldItemModifier).getTransferrable(true) && (m as PokemonHeldItemModifier).pokemonId === party[fromSlotIndex].id) as PokemonHeldItemModifier[];
                  const itemModifier = itemModifiers[itemIndex];
                  this.scene.tryTransferHeldItemModifier(itemModifier, party[toSlotIndex], true, true);
                });
              } else
                this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers));
            }, PartyUiHandler.FilterItemMaxStacks);
          } else {
            this.scene.lockModifierTiers = !this.scene.lockModifierTiers;
            const uiHandler = this.scene.ui.getHandler() as ModifierSelectUiHandler;
            uiHandler.setRerollCost(this.getRerollCost(typeOptions, this.scene.lockModifierTiers));
            uiHandler.updateLockRaritiesText();
            uiHandler.updateRerollCostText();
            return false;
          }
          return true;
        case 1:
          modifierType = typeOptions[cursor].type;
          break;
        default:
          const shopOptions = getPlayerShopModifierTypeOptionsForWave(this.scene.currentBattle.waveIndex, this.scene.getWaveMoneyAmount(1));
          const shopOption = shopOptions[rowCursor > 2 || shopOptions.length <= SHOP_OPTIONS_ROW_LIMIT ? cursor : cursor + SHOP_OPTIONS_ROW_LIMIT];
          modifierType = shopOption.type;
          cost = shopOption.cost;
          break;
      }

      if (cost && this.scene.money < cost) {
        this.scene.ui.playError();
        return false;
      }

      const applyModifier = (modifier: Modifier, playSound: boolean = false) => {
        const result = this.scene.addModifier(modifier, false, playSound);
        if (cost) {
          result.then(success => {
            if (success) {
              this.scene.money -= cost;
              this.scene.updateMoneyText();
              this.scene.playSound('buy');
              (this.scene.ui.getHandler() as ModifierSelectUiHandler).updateCostText();
            } else
              this.scene.ui.playError();
          });
        } else {
          const doEnd = () => {
            this.scene.ui.clearText();
            this.scene.ui.setMode(Mode.MESSAGE);
            super.end();
          };
          if (result instanceof Promise)
            result.then(() => doEnd());
          else
            doEnd();
        }
      };

      if (modifierType instanceof PokemonModifierType) {
        if (modifierType instanceof FusePokemonModifierType) {
          this.scene.ui.setModeWithoutClear(Mode.PARTY, PartyUiMode.SPLICE, -1, (fromSlotIndex: integer, spliceSlotIndex: integer) => {
            if (spliceSlotIndex !== undefined && fromSlotIndex < 6 && spliceSlotIndex < 6 && fromSlotIndex !== spliceSlotIndex) {
              this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer()).then(() => {
                const modifier = modifierType.newModifier(party[fromSlotIndex], party[spliceSlotIndex]);
                applyModifier(modifier, true);
              });
            } else
              this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers));
          }, modifierType.selectFilter);
        } else {
          const pokemonModifierType = modifierType as PokemonModifierType;
          const isMoveModifier = modifierType instanceof PokemonMoveModifierType;
          const isTmModifier = modifierType instanceof TmModifierType;
          const isRememberMoveModifier = modifierType instanceof RememberMoveModifierType;
          const partyUiMode = isMoveModifier ? PartyUiMode.MOVE_MODIFIER
            : isTmModifier ? PartyUiMode.TM_MODIFIER
            : isRememberMoveModifier ? PartyUiMode.REMEMBER_MOVE_MODIFIER
            : PartyUiMode.MODIFIER;
          const tmMoveId = isTmModifier
            ? (modifierType as TmModifierType).moveId
            : undefined;
          this.scene.ui.setModeWithoutClear(Mode.PARTY, partyUiMode, -1, (slotIndex: integer, option: PartyOption) => {
            if (slotIndex < 6) {
              this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer()).then(() => {
                const modifier = !isMoveModifier
                  ? !isRememberMoveModifier
                    ? modifierType.newModifier(party[slotIndex])
                  : modifierType.newModifier(party[slotIndex], option as integer)
                  : modifierType.newModifier(party[slotIndex], option - PartyOption.MOVE_1);
                applyModifier(modifier, true);
              });
            } else
              this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers));
          }, pokemonModifierType.selectFilter, modifierType instanceof PokemonMoveModifierType ? (modifierType as PokemonMoveModifierType).moveSelectFilter : undefined, tmMoveId);
        }
      } else
        applyModifier(modifierType.newModifier());

      return !cost;
    };
    this.scene.ui.setMode(Mode.MODIFIER_SELECT, this.isPlayer(), typeOptions, modifierSelectCallback, this.getRerollCost(typeOptions, this.scene.lockModifierTiers));
  }

  updateSeed(): void {
    this.scene.resetSeed();
  }

  isPlayer(): boolean {
    return true;
  }

  getRerollCost(typeOptions: ModifierTypeOption[], lockRarities: boolean): integer {
    let baseValue = 0;
    if (lockRarities) {
      const tierValues = [ 50, 125, 300, 750, 2000 ];
      for (let opt of typeOptions)
        baseValue += tierValues[opt.type.tier];
    } else
      baseValue = 250;
    return Math.ceil(this.scene.currentBattle.waveIndex / 10) * baseValue * Math.pow(2, this.rerollCount);
  }
  
  getPoolType(): ModifierPoolType {
    return ModifierPoolType.PLAYER;
  }

  getModifierTypeOptions(modifierCount: integer): ModifierTypeOption[] {
    return getPlayerModifierTypeOptions(modifierCount, this.scene.getParty(), this.scene.lockModifierTiers ? this.modifierTiers : undefined);
  }

  addModifier(modifier: Modifier): Promise<void> {
    return this.scene.addModifier(modifier, false, true);
  }
}

export class EggLapsePhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    const eggsToHatch: Egg[] = this.scene.gameData.eggs.filter((egg: Egg) => {
      return --egg.hatchWaves < 1
    })

    if (eggsToHatch.length) {
      this.scene.queueMessage('Oh?');
      
      for (let egg of eggsToHatch) 
        this.scene.unshiftPhase(new EggHatchPhase(this.scene, egg));
    
    }
    this.end();
  }
}

export class AddEnemyBuffModifierPhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    const waveIndex = this.scene.currentBattle.waveIndex;
    const tier = !(waveIndex % 1000) ? ModifierTier.ULTRA : !(waveIndex % 250) ? ModifierTier.GREAT : ModifierTier.COMMON;

    regenerateModifierPoolThresholds(this.scene.getEnemyParty(), ModifierPoolType.ENEMY_BUFF);
    
    const count = Math.ceil(waveIndex / 250);
    for (let i = 0; i < count; i++)
      this.scene.addEnemyModifier(getEnemyBuffModifierForWave(tier, this.scene.findModifiers(m => m instanceof EnemyPersistentModifier, false), this.scene), true, true);
    this.scene.updateModifiers(false, true).then(() => this.end());
  }
}

export class PartyHealPhase extends BattlePhase {
  private resumeBgm: boolean;

  constructor(scene: BattleScene, resumeBgm: boolean) {
    super(scene);

    this.resumeBgm = resumeBgm;
  }

  start() {
    super.start();

    const bgmPlaying = this.scene.isBgmPlaying();
    if (bgmPlaying)
      this.scene.fadeOutBgm(1000, false);
    this.scene.ui.fadeOut(1000).then(() => {
      for (let pokemon of this.scene.getParty()) {
        pokemon.hp = pokemon.getMaxHp();
        pokemon.resetStatus();
        for (let move of pokemon.moveset)
          move.ppUsed = 0;
        pokemon.updateInfo(true);
      }
      const healSong = this.scene.playSoundWithoutBgm('heal');
      this.scene.time.delayedCall(Utils.fixedInt(healSong.totalDuration * 1000), () => {
        healSong.destroy();
        if (this.resumeBgm && bgmPlaying)
          this.scene.playBgm();
        this.scene.ui.fadeIn(500).then(() => this.end());
      });
    });
  }
}

export class ShinySparklePhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    super.start();

    this.getPokemon().sparkle();
    this.scene.time.delayedCall(1000, () => this.end());
  }
}

export class ScanIvsPhase extends PokemonPhase {
  private shownIvs: integer;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, shownIvs: integer) {
    super(scene, battlerIndex);

    this.shownIvs = shownIvs;
  }

  start() {
    super.start();

    if (!this.shownIvs)
      return this.end();

    const pokemon = this.getPokemon();

    this.scene.ui.showText(`Use IV Scanner on ${pokemon.name}?`, null, () => {
      this.scene.ui.setMode(Mode.CONFIRM, () => {
        this.scene.ui.setMode(Mode.MESSAGE);
        this.scene.ui.clearText();
        new CommonBattleAnim(CommonAnim.LOCK_ON, pokemon, pokemon).play(this.scene, () => {
          this.scene.ui.getMessageHandler().promptIvs(pokemon.id, pokemon.ivs, this.shownIvs).then(() => this.end());
        });
      }, () => {
        this.scene.ui.setMode(Mode.MESSAGE);
        this.scene.ui.clearText();
        this.end();
      });
    });
  }
}

export class TrainerMessageTestPhase extends BattlePhase {
  private trainerTypes: TrainerType[];

  constructor(scene: BattleScene, ...trainerTypes: TrainerType[]) {
    super(scene);
    
    this.trainerTypes = trainerTypes;
  }

  start() {
    super.start();

    let testMessages: string[] = [];
    
    for (let t of Object.keys(trainerConfigs)) {
      const type = parseInt(t);
      if (this.trainerTypes.length && !this.trainerTypes.find(tt => tt === type as TrainerType))
        continue;
      const config = trainerConfigs[type];
      [ config.encounterMessages, config.femaleEncounterMessages, config.victoryMessages, config.femaleVictoryMessages, config.defeatMessages, config.femaleDefeatMessages ]
        .map(messages => {
          if (messages?.length)
            testMessages.push(...messages);
        });
    }

    for (let message of testMessages)
      this.scene.pushPhase(new TestMessagePhase(this.scene, message));

    this.end();
  }
}

export class TestMessagePhase extends MessagePhase {
  constructor(scene: BattleScene, message: string) {
    super(scene, message, null, true);
  }
}
