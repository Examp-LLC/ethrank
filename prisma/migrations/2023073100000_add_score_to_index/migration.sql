-- The following SQL will run for this change
ALTER TABLE `Address` 
  DROP KEY `Address_address_season_idx`, 
  ADD KEY `Address_address_season_score_idx` (`address`, `season`, `score`)