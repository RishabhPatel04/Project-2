package com.team1.f1_api.repository;

import com.team1.f1_api.model.Track;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrackRepository extends JpaRepository<Track, Long> {
    @Query(
        """
        SELECT t.region as region, count(distinct t.country) as countryCount
        FROM Track t
        WHERE t.region IS NOT NULL AND t.region<> ''
            and t.country IS NOT NULL AND t.country<> ''
        GROUP BY t.region
        """
    )
    List<ContinentCountView> countCountriesByRegion();

    @Query(
        """
        SELECT DISTINCT t.country
        FROM Track t
        WHERE t.region = :region
            AND t.country IS NOT NULL AND t.country <> ''
        ORDER BY t.country
        """
    )
    List<String> findCountriesByRegion(@Param("region") String region);
}
