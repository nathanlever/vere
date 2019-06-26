{-
    Generate FromNoun and ToNoun instances.
-}

module Data.Noun.Poet.TH where

import ClassyPrelude hiding (fromList)
import Control.Lens
import Data.Noun.Poet hiding (hsToHoon)

import Language.Haskell.TH
import Language.Haskell.TH.Syntax

import qualified Data.Char as C


--------------------------------------------------------------------------------

type ConInfo = (Name, [Type])

data Shape
    = Tup ConInfo
    | Enu [Name]
    | Sum [ConInfo]
  deriving (Eq, Ord, Show)

typeShape :: Name -> Q Shape
typeShape tyName = do
    cs <- reify tyName >>= \case
       TyConI (DataD _ nm [] _ cs _)   -> pure $ unpackCon <$> cs
       TyConI (NewtypeD _ nm [] _ c _) -> pure $ [unpackCon c]
       TyConI (DataD _ nm _ _ cs _)    -> fail "Type variables are unsupported"
       TyConI (NewtypeD _ nm _ _ c _)  -> fail "Type variables are unsupported"
       TyConI _                        -> fail badSynonym
       _                               -> fail "not type"

    let allEmpty = all (null . snd) cs

    if allEmpty
    then pure $ Enu $ fst <$> cs
    else
      case cs of
        []  -> pure $ Enu []
        [c] -> pure $ Tup c
        cs  -> pure $ Sum cs

  where
    badSynonym = "deriveFunctor: tyCon may not be a type synonym."

    unpackCon :: Con -> ConInfo
    unpackCon = \case
      NormalC nm bangTypes          -> (nm, snd <$> bangTypes)
      RecC nm varBangTypes          -> (nm, varBangTypes <&> (\(_, _, t) -> t))
      InfixC bangType1 nm bangType2 -> error "Infix Cnstrs are not supported"
      ForallC tyVarBndrs ctx con    -> error "Polymorphic tys are not supported"
      GadtC nm bangTypes ty         -> error "GADTs are not supported"
      RecGadtC nm varBangTypes ty   -> error "GADTs are not supported"

--------------------------------------------------------------------------------

deriveNoun :: Name -> Q [Dec]
deriveNoun n = (<>) <$> deriveToNoun n <*> deriveFromNoun n

--------------------------------------------------------------------------------

deriveToNoun :: Name -> Q [Dec]
deriveToNoun tyName = do
    body <- typeShape tyName <&> \case Tup con  -> tupToNoun con
                                       Enu cons -> enumToAtom cons
                                       Sum cons -> sumToNoun cons

    [d|
        instance ToNoun $(conT tyName) where
            toNoun = $(pure body)
      |]

--------------------------------------------------------------------------------

deriveFromNoun :: Name -> Q [Dec]
deriveFromNoun tyName = do
    body <- typeShape tyName <&> \case Tup con  -> tupFromNoun con
                                       Enu cons -> enumFromAtom cons
                                       Sum cons -> sumFromNoun cons


    [d|
        instance FromNoun $(conT tyName) where
            parseNoun = $(pure body)
      |]

enumFromAtom :: [Name] -> Exp
enumFromAtom nms = LamE [VarP n] body
  where
    n         = mkName "n"
    c         = mkName "c"
    getCord   = BindS (VarP c) $ AppE (VarE 'parseNoun) (VarE n)
    examine   = NoBindS $ CaseE (VarE c) (matches ++ [fallback])
    matches   = mkMatch <$> nms
    fallback  = Match WildP (NormalB $ AppE (VarE 'fail) matchFail) []
    body      = DoE [getCord, examine]
    matchFail = LitE $ StringL ("Expected one of: " <> possible)
    possible  = intercalate " " (('%':) . tagString <$> nms)
    mkMatch n = Match (ConP 'Cord [LitP (tagLit n)])
                  (NormalB $ AppE (VarE 'pure) (ConE n))
                  []

tupFromNoun :: ConInfo -> Exp
tupFromNoun _ = VarE 'undefined

sumFromNoun :: [ConInfo] -> Exp
sumFromNoun _ = VarE 'undefined

--------------------------------------------------------------------------------

tagString :: Name -> String
tagString = hsToHoon . nameStr
  where
    nameStr :: Name -> String
    nameStr (Name (OccName n) _) = n

tagLit :: Name -> Lit
tagLit = StringL . tagString

tagNoun :: Name -> Exp
tagNoun = AppE (VarE 'toNoun)
        . AppE (ConE 'Cord)
        . LitE
        . StringL
        . hsToHoon
        . nameStr
  where
    nameStr :: Name -> String
    nameStr (Name (OccName n) _) = n

tagTup :: Name -> [Name] -> Exp
tagTup c args = AppE (VarE 'toNoun) $ TupE (tagNoun c : fmap VarE args)

tup :: [Name] -> Exp
tup = AppE (VarE 'toNoun) . TupE . fmap VarE

--------------------------------------------------------------------------------

enumToAtom :: [Name] -> Exp
enumToAtom cons =
    LamCaseE $ cons <&> \nm ->
                 Match (ConP nm []) (NormalB $ tagNoun nm) []

tupToNoun :: ConInfo -> Exp
tupToNoun cons = LamCaseE [mkMatch cons]
  where
    mkMatch :: ConInfo -> Match
    mkMatch (nm, tys) = Match (ConP nm params) (NormalB body) []
      where vars   = (zip tys ['a'..]) <&> (mkName . singleton . snd)
            params = VarP <$> vars
            body   = tup vars

sumToNoun :: [ConInfo] -> Exp
sumToNoun cons = LamCaseE (cons <&> mkMatch)
  where
    mkMatch :: ConInfo -> Match
    mkMatch (nm, tys) = Match (ConP nm params) (NormalB body) []
      where vars   = (zip tys ['a'..]) <&> (mkName . singleton . snd)
            params = VarP <$> vars
            body   = tagTup nm vars

--------------------------------------------------------------------------------

hsToHoon :: String -> String
hsToHoon = go []
  where
    go acc []     = intercalate "-" $ reverse acc
    go acc (c:cs) = go (elem:acc) remain
      where
        head           = C.toLower c
        (tail, remain) = break C.isUpper cs
        elem           = head:tail
